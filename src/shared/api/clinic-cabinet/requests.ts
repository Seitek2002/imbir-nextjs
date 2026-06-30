import { apiClient } from "../client";
import type { DoctorAppointment } from "../doctor-cabinet/types";
import type { PaginatedReviewsResponse } from "../reviews/types";
import type { ServiceListItem } from "../services/types";
import { PaginatedResponse } from "../types";
import {
  ClinicAppointmentFilters,
  ClinicDoctorItem,
  ClinicPrivateProfile,
  ClinicServiceBody,
  ClinicStats,
  CreateInviteRequest,
  InviteLink,
  UpdateBranchRequest,
} from "./types";

export const getClinicProfile = async (): Promise<ClinicPrivateProfile> => {
  // Ответ — плоский объект (ClinicOwnProfile), без обёртки { data }.
  const { data } = await apiClient.get<ClinicPrivateProfile>(
    "/api/clinic/profile/",
  );
  return data;
};

export const updateClinicProfile = async (
  body: Partial<ClinicPrivateProfile>,
): Promise<ClinicPrivateProfile> => {
  const { data } = await apiClient.put<ClinicPrivateProfile>(
    "/api/clinic/profile/",
    body,
  );
  return data;
};

export const updateClinicBranch = async (
  branchId: string,
  body: UpdateBranchRequest,
): Promise<void> => {
  await apiClient.put(`/api/clinic/branches/${branchId}/`, body);
};

export const getClinicDoctors = async (): Promise<{
  data: ClinicDoctorItem[];
}> => {
  const { data } = await apiClient.get<{ data: ClinicDoctorItem[] }>(
    "/api/clinic/doctors/",
  );
  return data;
};

export const detachClinicDoctor = async (doctorId: number): Promise<void> => {
  await apiClient.delete(`/api/clinic/doctors/${doctorId}/`);
};

export const getClinicServices = async (): Promise<{
  data: ServiceListItem[];
}> => {
  const { data } = await apiClient.get<{ data: ServiceListItem[] }>(
    "/api/clinic/services/",
  );
  return data;
};

export const addClinicService = async (
  body: ClinicServiceBody,
): Promise<ServiceListItem> => {
  const { data } = await apiClient.post<ServiceListItem>(
    "/api/clinic/services/",
    body,
  );
  return data;
};

export const updateClinicService = async (
  id: number,
  body: ClinicServiceBody,
): Promise<ServiceListItem> => {
  const { data } = await apiClient.put<ServiceListItem>(
    `/api/clinic/services/${id}/`,
    body,
  );
  return data;
};

export const deleteClinicService = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/clinic/services/${id}/`);
};

export const getClinicAppointments = async (
  filters: ClinicAppointmentFilters = {},
): Promise<PaginatedResponse<DoctorAppointment>> => {
  const { data } = await apiClient.get<PaginatedResponse<DoctorAppointment>>(
    "/api/clinic/appointments/",
    { params: filters },
  );
  return data;
};

export const getClinicStats = async (): Promise<ClinicStats> => {
  const { data } = await apiClient.get<{ data: ClinicStats }>(
    "/api/clinic/stats/",
  );
  return data.data;
};

export const getClinicReviews = async (): Promise<PaginatedReviewsResponse> => {
  const { data } = await apiClient.get<PaginatedReviewsResponse>(
    "/api/clinic/reviews/",
  );
  return data;
};

export const getClinicInvites = async (): Promise<{ data: InviteLink[] }> => {
  const { data } = await apiClient.get<{ data: InviteLink[] }>(
    "/api/clinic/invites/",
  );
  return data;
};

export const createClinicInvite = async (
  body: CreateInviteRequest = {},
): Promise<InviteLink> => {
  const { data } = await apiClient.post<InviteLink>(
    "/api/clinic/invites/",
    body,
  );
  return data;
};

export const deleteClinicInvite = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/clinic/invites/${id}/`);
};
