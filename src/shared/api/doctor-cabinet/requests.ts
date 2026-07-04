import { apiClient } from "../client";
import type { PaginatedReviewsResponse } from "../reviews/types";
import { PaginatedResponse } from "../types";
import {
  DoctorAppointment,
  DoctorAppointmentFilters,
  DoctorAppointmentSummary,
  DoctorPatient,
  DoctorPatientFilters,
  DoctorPrivateProfile,
  DoctorSchedule,
  DoctorServiceBody,
  DoctorServiceItem,
  DoctorStats,
} from "./types";

export const getDoctorProfile = async (): Promise<DoctorPrivateProfile> => {
  const { data } = await apiClient.get<DoctorPrivateProfile>(
    "/api/doctor/profile/",
  );
  return data;
};

// Писчие поля PUT /api/doctor/profile/ (схема DoctorOwnProfileRequest).
// Заданы явно, т.к. DoctorPrivateProfile унаследован от публичного типа и
// рассинхронизирован с реальным ответом бэка (first_name/last_name, gender...).
export type UpdateDoctorProfileBody = {
  first_name?: string;
  last_name?: string;
  phone?: string;
  gender?: string;
  birth_date?: string | null;
  city?: string;
  languages?: string[];
  photo?: File | string | null;
  country?: string;
  address?: string;
  website?: string;
  about?: string;
  experience_years?: number;
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
  skills?: string[];
  education?: unknown[];
  work_experience?: unknown[];
};

export const updateDoctorProfile = async (
  body: UpdateDoctorProfileBody,
): Promise<DoctorPrivateProfile> => {
  // Если есть файл (фото) — шлём multipart, иначе JSON. В multipart массивы/
  // объекты (languages, специализации и т.д.) сериализуем в JSON-строку —
  // бэкенд их так принимает.
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
    const { data } = await apiClient.put<DoctorPrivateProfile>(
      "/api/doctor/profile/",
      form,
    );
    return data;
  }

  const { data } = await apiClient.put<DoctorPrivateProfile>(
    "/api/doctor/profile/",
    body,
  );
  return data;
};

// Ответ плоский ({schedule, lunch_break, emergency_24_7}), без обёртки data —
// проверено живым запросом.
export const getDoctorSchedule = async (): Promise<DoctorSchedule> => {
  const { data } = await apiClient.get<DoctorSchedule>("/api/doctor/schedule/");
  return data;
};

export const updateDoctorSchedule = async (
  body: DoctorSchedule,
): Promise<DoctorSchedule> => {
  const { data } = await apiClient.put<DoctorSchedule>(
    "/api/doctor/schedule/",
    body,
  );
  return data;
};

export const getDoctorAppointments = async (
  filters: DoctorAppointmentFilters = {},
): Promise<PaginatedResponse<DoctorAppointment>> => {
  const { data } = await apiClient.get<PaginatedResponse<DoctorAppointment>>(
    "/api/doctor/appointments/",
    { params: filters },
  );
  return data;
};

export const getDoctorPatients = async (
  filters: DoctorPatientFilters = {},
): Promise<PaginatedResponse<DoctorPatient>> => {
  const { data } = await apiClient.get<PaginatedResponse<DoctorPatient>>(
    "/api/doctor/patients/",
    { params: filters },
  );
  return data;
};

// Итоги приёма: диагноз/рекомендации/заметки врача по конкретной записи.
export const getAppointmentSummary = async (
  id: number,
): Promise<DoctorAppointmentSummary> => {
  const { data } = await apiClient.get<DoctorAppointmentSummary>(
    `/api/doctor/appointments/${id}/summary/`,
  );
  return data;
};

export const updateAppointmentSummary = async (
  id: number,
  body: Partial<DoctorAppointmentSummary>,
): Promise<DoctorAppointmentSummary> => {
  const { data } = await apiClient.patch<DoctorAppointmentSummary>(
    `/api/doctor/appointments/${id}/summary/`,
    body,
  );
  return data;
};

// Ответ плоский (без обёртки data) — проверено живым запросом.
export const getDoctorStats = async (): Promise<DoctorStats> => {
  const { data } = await apiClient.get<DoctorStats>("/api/doctor/stats/");
  return data;
};

export const getDoctorReviews = async (): Promise<PaginatedReviewsResponse> => {
  const { data } = await apiClient.get<PaginatedReviewsResponse>(
    "/api/doctor/reviews/",
  );
  return data;
};

export const getDoctorServices = async (): Promise<{
  data: DoctorServiceItem[];
}> => {
  const { data } = await apiClient.get<{ data: DoctorServiceItem[] }>(
    "/api/doctor/services/",
  );
  return data;
};

export const addDoctorService = async (
  body: DoctorServiceBody,
): Promise<DoctorServiceItem> => {
  const { data } = await apiClient.post<DoctorServiceItem>(
    "/api/doctor/services/",
    body,
  );
  return data;
};

export const deleteDoctorService = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/doctor/services/${id}/`);
};
