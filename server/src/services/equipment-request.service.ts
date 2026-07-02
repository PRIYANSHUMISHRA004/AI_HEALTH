import { Types } from "mongoose";

import { Equipment, EquipmentRequest, Hospital } from "../models";
import { HttpError } from "../utils/http-error";
import { getIO } from "../sockets";

export const createEquipmentRequest = async (payload: {
  equipmentId: string;
  requestingHospitalId: string;
  requestedBy: string;
  message?: string;
}) => {
  const { equipmentId, requestingHospitalId, requestedBy, message } = payload;

  const equipment = await Equipment.findById(equipmentId);
  if (!equipment) throw new HttpError(404, "Equipment not found");

  const isSameHospital = equipment.hospitalId.toString() === requestingHospitalId;

  const existing = await EquipmentRequest.findOne({
    equipmentId,
    requestingHospitalId,
    status: { $in: ["pending", "approved"] },
  });
  if (existing) throw new HttpError(409, "An active request already exists for this equipment");

  const [requestingHospital, owningHospital] = await Promise.all([
    Hospital.findById(requestingHospitalId),
    Hospital.findById(equipment.hospitalId),
  ]);

  if (!requestingHospital) throw new HttpError(404, "Requesting hospital not found");
  if (!owningHospital) throw new HttpError(404, "Owning hospital not found");

  // Same-hospital request: auto-approve immediately (internal use tracking)
  if (isSameHospital) {
    const request = await EquipmentRequest.create({
      equipmentId: new Types.ObjectId(equipmentId),
      equipmentName: equipment.name,
      requestingHospitalId: new Types.ObjectId(requestingHospitalId),
      requestingHospitalName: requestingHospital.name,
      owningHospitalId: equipment.hospitalId,
      owningHospitalName: owningHospital.name,
      requestedBy: new Types.ObjectId(requestedBy),
      status: "approved",
      message,
      responseMessage: "Auto-approved — internal use",
    });
    await Equipment.findByIdAndUpdate(equipmentId, { status: "in-use" });
    return request;
  }

  const request = await EquipmentRequest.create({
    equipmentId: new Types.ObjectId(equipmentId),
    equipmentName: equipment.name,
    requestingHospitalId: new Types.ObjectId(requestingHospitalId),
    requestingHospitalName: requestingHospital.name,
    owningHospitalId: equipment.hospitalId,
    owningHospitalName: owningHospital.name,
    requestedBy: new Types.ObjectId(requestedBy),
    status: "pending",
    message,
  });

  // Notify owning hospital
  try {
    getIO().emit("equipment:request:new", {
      requestId: request._id.toString(),
      equipmentName: equipment.name,
      requestingHospitalName: requestingHospital.name,
      owningHospitalId: equipment.hospitalId.toString(),
      message,
    });
  } catch {}

  return request;
};

export const getIncomingRequests = async (hospitalId: string) => {
  return EquipmentRequest.find({ owningHospitalId: hospitalId })
    .sort({ createdAt: -1 })
    .lean();
};

export const getOutgoingRequests = async (hospitalId: string) => {
  return EquipmentRequest.find({ requestingHospitalId: hospitalId })
    .sort({ createdAt: -1 })
    .lean();
};

export const approveRequest = async (requestId: string, hospitalId: string, responseMessage?: string) => {
  const request = await EquipmentRequest.findById(requestId);
  if (!request) throw new HttpError(404, "Request not found");
  if (request.owningHospitalId.toString() !== hospitalId) throw new HttpError(403, "Not authorized");
  if (request.status !== "pending") throw new HttpError(400, "Request is no longer pending");

  request.status = "approved";
  if (responseMessage) request.responseMessage = responseMessage;
  await request.save();

  // Mark the equipment as in-use
  await Equipment.findByIdAndUpdate(request.equipmentId, { status: "in-use" });

  // Notify requesting hospital
  try {
    getIO().emit("equipment:request:resolved", {
      requestId: request._id.toString(),
      equipmentName: request.equipmentName,
      owningHospitalName: request.owningHospitalName,
      requestingHospitalId: request.requestingHospitalId.toString(),
      status: "approved",
      responseMessage,
    });
  } catch {}

  return request;
};

export const rejectRequest = async (requestId: string, hospitalId: string, responseMessage?: string) => {
  const request = await EquipmentRequest.findById(requestId);
  if (!request) throw new HttpError(404, "Request not found");
  if (request.owningHospitalId.toString() !== hospitalId) throw new HttpError(403, "Not authorized");
  if (request.status !== "pending") throw new HttpError(400, "Request is no longer pending");

  request.status = "rejected";
  if (responseMessage) request.responseMessage = responseMessage;
  await request.save();

  // Notify requesting hospital
  try {
    getIO().emit("equipment:request:resolved", {
      requestId: request._id.toString(),
      equipmentName: request.equipmentName,
      owningHospitalName: request.owningHospitalName,
      requestingHospitalId: request.requestingHospitalId.toString(),
      status: "rejected",
      responseMessage,
    });
  } catch {}

  return request;
};

export const returnEquipment = async (requestId: string, requestingHospitalId: string) => {
  const request = await EquipmentRequest.findById(requestId);
  if (!request) throw new HttpError(404, "Request not found");
  if (request.requestingHospitalId.toString() !== requestingHospitalId) throw new HttpError(403, "Not authorized");
  if (request.status !== "approved") throw new HttpError(400, "Only approved requests can be returned");

  request.status = "returned";
  request.returnedAt = new Date();
  await request.save();

  // Free the equipment back to available
  await Equipment.findByIdAndUpdate(request.equipmentId, { status: "available" });

  // Notify owning hospital
  try {
    getIO().emit("equipment:request:returned", {
      requestId: request._id.toString(),
      equipmentName: request.equipmentName,
      requestingHospitalName: request.requestingHospitalName,
      owningHospitalId: request.owningHospitalId.toString(),
    });
  } catch {}

  return request;
};

export const getBorrowedEquipment = async (requestingHospitalId: string) => {
  return EquipmentRequest.find({ requestingHospitalId, status: "approved" })
    .sort({ updatedAt: -1 })
    .lean();
};
