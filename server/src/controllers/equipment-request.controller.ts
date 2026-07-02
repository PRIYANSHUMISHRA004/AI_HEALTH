import { Request, Response } from "express";

import { AuthenticatedRequest } from "../middleware/auth.middleware";
import {
  approveRequest,
  createEquipmentRequest,
  getBorrowedEquipment,
  getIncomingRequests,
  getOutgoingRequests,
  rejectRequest,
  returnEquipment,
} from "../services/equipment-request.service";
import { jsonSuccess } from "../utils/respond";

export const createRequest = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthenticatedRequest;
  const result = await createEquipmentRequest({
    equipmentId: req.body.equipmentId,
    requestingHospitalId: req.body.requestingHospitalId,
    requestedBy: authReq.user.userId,
    message: req.body.message,
  });
  jsonSuccess(res, { message: "Request sent successfully", data: result }, 201);
};

export const listIncoming = async (req: Request, res: Response): Promise<void> => {
  const { hospitalId } = req.query as { hospitalId: string };
  const data = await getIncomingRequests(hospitalId);
  jsonSuccess(res, { data });
};

export const listOutgoing = async (req: Request, res: Response): Promise<void> => {
  const { hospitalId } = req.query as { hospitalId: string };
  const data = await getOutgoingRequests(hospitalId);
  jsonSuccess(res, { data });
};

export const approve = async (req: Request, res: Response): Promise<void> => {
  const authReq = req as AuthenticatedRequest;
  const hospitalId = req.body.hospitalId as string;
  const result = await approveRequest(req.params.id, hospitalId, req.body.responseMessage);
  jsonSuccess(res, { message: "Request approved", data: result });
};

export const reject = async (req: Request, res: Response): Promise<void> => {
  const hospitalId = req.body.hospitalId as string;
  const result = await rejectRequest(req.params.id, hospitalId, req.body.responseMessage);
  jsonSuccess(res, { message: "Request rejected", data: result });
};

export const returnBorrowedEquipment = async (req: Request, res: Response): Promise<void> => {
  const requestingHospitalId = req.body.requestingHospitalId as string;
  const result = await returnEquipment(req.params.id, requestingHospitalId);
  jsonSuccess(res, { message: "Equipment returned successfully", data: result });
};

export const listBorrowed = async (req: Request, res: Response): Promise<void> => {
  const { hospitalId } = req.query as { hospitalId: string };
  const data = await getBorrowedEquipment(hospitalId);
  jsonSuccess(res, { data });
};
