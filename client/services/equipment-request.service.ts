import { apiClient } from "@/lib/api";

export interface EquipmentRequestRecord {
  _id: string;
  equipmentId: string;
  equipmentName: string;
  requestingHospitalId: string;
  requestingHospitalName: string;
  owningHospitalId: string;
  owningHospitalName: string;
  requestedBy: string;
  status: "pending" | "approved" | "rejected" | "returned";
  message?: string;
  responseMessage?: string;
  returnedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const withAuth = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } });

export const equipmentRequestService = {
  create: (
    payload: { equipmentId: string; requestingHospitalId: string; message?: string },
    token: string
  ) =>
    apiClient.post<EquipmentRequestRecord>("/api/equipment-requests", payload, withAuth(token)),

  incoming: (hospitalId: string, token: string) =>
    apiClient.get<EquipmentRequestRecord[]>(
      `/api/equipment-requests/incoming?hospitalId=${hospitalId}`,
      withAuth(token)
    ),

  outgoing: (hospitalId: string, token: string) =>
    apiClient.get<EquipmentRequestRecord[]>(
      `/api/equipment-requests/outgoing?hospitalId=${hospitalId}`,
      withAuth(token)
    ),

  approve: (id: string, hospitalId: string, responseMessage: string | undefined, token: string) =>
    apiClient.patch<EquipmentRequestRecord>(
      `/api/equipment-requests/${id}/approve`,
      { hospitalId, responseMessage },
      withAuth(token)
    ),

  reject: (id: string, hospitalId: string, responseMessage: string | undefined, token: string) =>
    apiClient.patch<EquipmentRequestRecord>(
      `/api/equipment-requests/${id}/reject`,
      { hospitalId, responseMessage },
      withAuth(token)
    ),

  borrowed: (hospitalId: string, token: string) =>
    apiClient.get<EquipmentRequestRecord[]>(
      `/api/equipment-requests/borrowed?hospitalId=${hospitalId}`,
      withAuth(token)
    ),

  returnEquipment: (id: string, requestingHospitalId: string, token: string) =>
    apiClient.patch<EquipmentRequestRecord>(
      `/api/equipment-requests/${id}/return`,
      { requestingHospitalId },
      withAuth(token)
    ),
};
