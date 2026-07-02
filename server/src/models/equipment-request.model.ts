import { HydratedDocument, Model, Schema, Types, model } from "mongoose";

export const EQUIPMENT_REQUEST_STATUSES = ["pending", "approved", "rejected", "returned"] as const;
export type EquipmentRequestStatus = (typeof EQUIPMENT_REQUEST_STATUSES)[number];

export interface IEquipmentRequest {
  equipmentId: Types.ObjectId;
  equipmentName: string;
  requestingHospitalId: Types.ObjectId;
  requestingHospitalName: string;
  owningHospitalId: Types.ObjectId;
  owningHospitalName: string;
  requestedBy: Types.ObjectId;
  status: EquipmentRequestStatus;
  message?: string;
  responseMessage?: string;
  returnedAt?: Date;
}

type EquipmentRequestModel = Model<IEquipmentRequest>;
export type EquipmentRequestDocument = HydratedDocument<IEquipmentRequest>;

const equipmentRequestSchema = new Schema<IEquipmentRequest, EquipmentRequestModel>(
  {
    equipmentId: { type: Schema.Types.ObjectId, ref: "Equipment", required: true },
    equipmentName: { type: String, required: true, trim: true },
    requestingHospitalId: { type: Schema.Types.ObjectId, ref: "Hospital", required: true },
    requestingHospitalName: { type: String, required: true, trim: true },
    owningHospitalId: { type: Schema.Types.ObjectId, ref: "Hospital", required: true },
    owningHospitalName: { type: String, required: true, trim: true },
    requestedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: EQUIPMENT_REQUEST_STATUSES, default: "pending", required: true },
    returnedAt: { type: Date },
    message: { type: String, trim: true },
    responseMessage: { type: String, trim: true },
  },
  { timestamps: true }
);

equipmentRequestSchema.index({ owningHospitalId: 1, status: 1 });
equipmentRequestSchema.index({ requestingHospitalId: 1, status: 1 });

export const EquipmentRequest = model<IEquipmentRequest, EquipmentRequestModel>(
  "EquipmentRequest",
  equipmentRequestSchema
);
