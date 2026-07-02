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

export interface AppointmentPatientPreview {
  _id?: string;
  name: string;
  email?: string;
  phone?: string;
  role?: UserRole;
}

export interface AppointmentHospitalPreview {
  _id?: string;
  name: string;
  city?: string;
  state?: string;
  contactNumber?: string;
  availabilityStatus?: HospitalAvailabilityStatus;
}

export interface AppointmentDoctorPreview {
  _id?: string;
  name: string;
  specialization?: string;
  department?: string;
  availability?: boolean;
  averageRating?: number;
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
  hospitalId:
    | string
    | {
        _id?: string;
        name: string;
        city?: string;
        state?: string;
        contactNumber?: string;
        availabilityStatus?: HospitalAvailabilityStatus;
      };
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
  patientId: string | AppointmentPatientPreview;
  hospitalId: string | AppointmentHospitalPreview;
  doctorId: string | AppointmentDoctorPreview;
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

export interface ChatSenderPreview {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
}

export interface ChatMessage {
  id: string;
  chatRoomId: string;
  message: string;
  senderRole: MessageSenderRole;
  attachments: MediaAttachment[];
  readBy: string[];
  sender: ChatSenderPreview | null;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsDistributionItem {
  label: string;
  count: number;
}

export interface AnalyticsTrendPoint {
  date: string;
  count: number;
}

export interface AnalyticsHospitalScope {
  id: string;
  name: string;
}

export interface OverviewAnalytics {
  hospital: AnalyticsHospitalScope;
  totals: {
    doctors: number;
    equipment: number;
    ambulances: number;
    appointments: number;
    issues: number;
    reviews: number;
  };
  distributions: {
    equipmentStatus: AnalyticsDistributionItem[];
    appointmentStatus: AnalyticsDistributionItem[];
    issueStatus: AnalyticsDistributionItem[];
  };
  trends: {
    appointments: {
      last7Days: AnalyticsTrendPoint[];
      last30Days: AnalyticsTrendPoint[];
    };
    issues: {
      last7Days: AnalyticsTrendPoint[];
      last30Days: AnalyticsTrendPoint[];
    };
  };
}

export interface EquipmentAnalytics {
  hospital: AnalyticsHospitalScope;
  totals: {
    equipment: number;
  };
  statusDistribution: AnalyticsDistributionItem[];
  mostUsedEquipmentTypes: Array<{
    type: string;
    count: number;
  }>;
  trends: {
    last7Days: AnalyticsTrendPoint[];
    last30Days: AnalyticsTrendPoint[];
  };
}

export interface IssueAnalytics {
  hospital: AnalyticsHospitalScope;
  totals: {
    issues: number;
  };
  statusDistribution: AnalyticsDistributionItem[];
  topIssueTypes: Array<{
    issueType: string;
    count: number;
  }>;
  trends: {
    last7Days: AnalyticsTrendPoint[];
    last30Days: AnalyticsTrendPoint[];
  };
}

export interface AppointmentAnalytics {
  hospital: AnalyticsHospitalScope;
  totals: {
    appointments: number;
  };
  statusDistribution: AnalyticsDistributionItem[];
  trends: {
    last7Days: AnalyticsTrendPoint[];
    last30Days: AnalyticsTrendPoint[];
  };
}

export interface GlobalSearchHospitalResult {
  _id?: string;
  name: string;
  city?: string;
  state?: string;
  specialties?: string[];
  availabilityStatus?: HospitalAvailabilityStatus;
  averageRating?: number;
}

export interface GlobalSearchDoctorResult {
  _id?: string;
  name: string;
  specialization?: string;
  department?: string;
  averageRating?: number;
  hospitalId?:
    | string
    | {
        _id?: string;
        name: string;
        city?: string;
        state?: string;
      };
}

export interface GlobalSearchEquipmentResult {
  _id?: string;
  name: string;
  type?: string;
  status?: EquipmentStatus;
  hospitalSection?: string;
  hospitalId?:
    | string
    | {
        _id?: string;
        name: string;
        city?: string;
        state?: string;
      };
}

export interface GlobalSearchShopResult {
  _id?: string;
  name: string;
  area?: string;
  city?: string;
  state?: string;
  availableMedicines?: string[];
}

export interface GlobalSearchResponse {
  query: string;
  hospitals: GlobalSearchHospitalResult[];
  doctors: GlobalSearchDoctorResult[];
  equipment: GlobalSearchEquipmentResult[];
  shops: GlobalSearchShopResult[];
}

export interface AIInsight {
  id: string;
  title: string;
  insight: string;
}

export interface AIInsightsResponse {
  hospital: AnalyticsHospitalScope;
  insights: AIInsight[];
}

export interface EmergencyHospitalRecommendation {
  id: string;
  name: string;
  city: string;
  state: string;
  address: string;
  contactNumber: string;
  emergencyContact: string;
  availabilityStatus: HospitalAvailabilityStatus;
  distanceKm?: number;
  availableEquipmentCount: number;
  availableAmbulanceCount: number;
  matchReason: string;
}

export interface EmergencyEquipmentRecommendation {
  id: string;
  name: string;
  type: string;
  status: EquipmentStatus;
  hospitalSection: string;
  hospital: {
    id: string;
    name: string;
    city: string;
    state: string;
    contactNumber: string;
  };
}

export interface EmergencyAmbulanceRecommendation {
  id: string;
  vehicleNumber: string;
  driverName: string;
  contactNumber: string;
  currentLocation?: string;
  hospital: {
    id: string;
    name: string;
    city: string;
    state: string;
    emergencyContact: string;
  };
}

export interface EmergencyInterpretation {
  summary: string;
  priority: "critical" | "high" | "medium";
  suggestedDepartment?: string;
  equipmentHints: string[];
  locationHints: {
    city?: string;
    state?: string;
  };
}

export interface EmergencyResponse {
  query: {
    problemDescription: string;
    location: string;
  };
  interpretation: EmergencyInterpretation;
  bestHospital: EmergencyHospitalRecommendation | null;
  bestEquipment: EmergencyEquipmentRecommendation | null;
  bestAmbulance: EmergencyAmbulanceRecommendation | null;
  nearbyHospitals: EmergencyHospitalRecommendation[];
  contactInfo: {
    hospitalContact?: string;
    emergencyContact?: string;
    ambulanceContact?: string;
  };
}
