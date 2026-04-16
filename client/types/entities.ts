import type { BaseEntity, GeoPoint, MediaAttachment } from "@/types/common";

export type UserRole = "patient" | "hospital_admin" | "doctor";
export type HospitalAvailabilityStatus = "free" | "busy";
export type EquipmentStatus = "available" | "in-use" | "maintenance";
export type AmbulanceStatus = "available" | "busy" | "maintenance";
export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";
export type IssueRoleType = "patient" | "hospital";
export type IssueType = "public-help" | "equipment-shortage" | "ambulance-request" | "general";
export type IssueStatus = "open" | "in-progress" | "resolved";
export type ReviewTargetType = "hospital" | "doctor";
export type MessageSenderRole = UserRole;

export interface ReviewAuthorPreview {
  _id?: string;
  name: string;
  email?: string;
  role?: UserRole;
}

export interface User extends BaseEntity {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  linkedHospitalId?: string;
}

export interface Hospital extends BaseEntity {
  name: string;
  description: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  location: GeoPoint;
  specialties: string[];
  facilities: string[];
  departments: string[];
  contactNumber: string;
  emergencyContact: string;
  ambulanceCount: number;
  averageRating: number;
  availabilityStatus: HospitalAvailabilityStatus;
  embeddingText: string;
  embedding: number[];
}

export interface Doctor extends BaseEntity {
  hospitalId: string;
  name: string;
  specialization: string;
  department: string;
  experience: number;
  availability: boolean;
  averageRating: number;
}

export interface Equipment extends BaseEntity {
  hospitalId: string;
  name: string;
  type: string;
  status: EquipmentStatus;
  hospitalSection: string;
  assignedTo?: string;
  lastUsedBy?: string;
  embeddingText: string;
  embedding: number[];
}

export interface Ambulance extends BaseEntity {
  hospitalId: string;
  vehicleNumber: string;
  driverName: string;
  contactNumber: string;
  status: AmbulanceStatus;
  currentLocation?: string;
}

export interface Appointment extends BaseEntity {
  patientId: string;
  hospitalId: string;
  doctorId: string;
  caseSummary: string;
  appointmentDate: string;
  status: AppointmentStatus;
}

export interface Issue extends BaseEntity {
  createdBy: string;
  roleType: IssueRoleType;
  issueType: IssueType;
  title: string;
  description: string;
  hospitalId?: string;
  status: IssueStatus;
  resolvedBy?: string;
  resolvedAt?: string;
  attachments: MediaAttachment[];
}

export interface Review extends BaseEntity {
  targetType: ReviewTargetType;
  targetId: string;
  rating: number;
  comment: string;
  createdBy?: string | ReviewAuthorPreview;
}

export interface MedicalShop extends BaseEntity {
  name: string;
  area: string;
  city: string;
  state: string;
  pincode?: string;
  location: GeoPoint;
  contactNumber: string;
  availableMedicines: string[];
  embeddingText: string;
  embedding: number[];
}

export interface Message extends BaseEntity {
  chatRoomId: string;
  senderId: string;
  senderRole: MessageSenderRole;
  message: string;
  attachments: MediaAttachment[];
  readBy: string[];
}
