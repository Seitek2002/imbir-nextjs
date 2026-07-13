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
  const { data } = await apiClient.get<ClinicPrivateProfile>(
    "/api/clinic/profile/",
  );
  return data;
};

// Писчие поля PUT /api/clinic/profile/ (схема ClinicOwnProfileRequest).
// Заданы явно: ClinicPrivateProfile унаследован от публичного типа и
// не совпадает с реальным ответом (description, logo-binary и т.д.).
export type UpdateClinicProfileBody = {
  name?: string;
  clinic_type?: string;
  description?: string;
  logo?: File | string | null;
  phone?: string;
  website?: string;
  country?: string;
  city?: string;
  address?: string;
  latitude?: string;
  longitude?: string;
  legal_name?: string;
  reg_number?: string;
  license_number?: string;
  license_date?: string | null;
  license_authority?: string;
  primary_specializations?: string[];
  narrow_specializations?: string[];
  additional_services?: string;
  equipment?: string[];
  patient_conditions?: string[];
  payment_methods?: string[];
  emergency_24_7?: boolean;
  schedule?: Record<string, { from: string; to: string; enabled: boolean }>;
  lunch_break?: { from: string; to: string };
};

export const updateClinicProfile = async (
  body: UpdateClinicProfileBody,
): Promise<ClinicPrivateProfile> => {
  // Логотип (File) требует multipart; массивы/объекты сериализуем в JSON-строку.
  const hasFile = Object.values(body).some((v) => v instanceof File);

  if (hasFile) {
    const form = new FormData();
    Object.entries(body).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (value instanceof File) form.append(key, value);
      else if (typeof value === "object")
        form.append(key, JSON.stringify(value));
      else form.append(key, String(value));
    });
    const { data } = await apiClient.put<ClinicPrivateProfile>(
      "/api/clinic/profile/",
      form,
    );
    return data;
  }

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

// Ответ плоский (без обёртки data) — проверено живым запросом.
export const getClinicStats = async (): Promise<ClinicStats> => {
  const { data } = await apiClient.get<ClinicStats>("/api/clinic/stats/");
  return data;
};

export const getClinicReviews = async (): Promise<PaginatedReviewsResponse> => {
  const { data } = await apiClient.get<PaginatedReviewsResponse>(
    "/api/clinic/reviews/",
  );
  return data;
};

export const getClinicInvites = async (): Promise<InviteLink[]> => {
  const { data } = await apiClient.get<InviteLink[]>("/api/clinic/invites/");
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
