import { apiClient } from "../client";
import type { PaginatedReviewsResponse } from "../reviews/types";
import { PaginatedResponse } from "../types";
import {
  DoctorAppointment,
  DoctorAppointmentFilters,
  DoctorPatient,
  DoctorPatientFilters,
  DoctorPrivateProfile,
  DoctorSchedule,
  DoctorServiceItem,
  DoctorServiceWrite,
  DoctorStats,
} from "./types";

export const getDoctorProfile = async (): Promise<DoctorPrivateProfile> => {
  // Ответ — плоский объект (DoctorOwnProfile), без обёртки { data }.
  const { data } = await apiClient.get<DoctorPrivateProfile>(
    "/api/doctor/profile/",
  );
  return data;
};

export const updateDoctorProfile = async (
  body: Partial<DoctorPrivateProfile>,
): Promise<DoctorPrivateProfile> => {
  const { data } = await apiClient.put<DoctorPrivateProfile>(
    "/api/doctor/profile/",
    body,
  );
  return data;
};

export const getDoctorSchedule = async (): Promise<DoctorSchedule> => {
  const { data } = await apiClient.get<{ data: DoctorSchedule }>(
    "/api/doctor/schedule/",
  );
  return data.data;
};

export const updateDoctorSchedule = async (
  body: DoctorSchedule,
): Promise<DoctorSchedule> => {
  const { data } = await apiClient.put<{ data: DoctorSchedule }>(
    "/api/doctor/schedule/",
    body,
  );
  return data.data;
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

export const getDoctorStats = async (): Promise<DoctorStats> => {
  const { data } = await apiClient.get<{ data: DoctorStats }>(
    "/api/doctor/stats/",
  );
  return data.data;
};

export const getDoctorReviews = async (): Promise<PaginatedReviewsResponse> => {
  const { data } = await apiClient.get<PaginatedReviewsResponse>(
    "/api/doctor/reviews/",
  );
  return data;
};

export const getDoctorServices = async (): Promise<
  PaginatedResponse<DoctorServiceItem>
> => {
  const { data } = await apiClient.get<PaginatedResponse<DoctorServiceItem>>(
    "/api/doctor/services/",
  );
  return data;
};

export const createDoctorService = async (
  body: DoctorServiceWrite,
): Promise<DoctorServiceItem> => {
  const { data } = await apiClient.post<DoctorServiceItem>(
    "/api/doctor/services/",
    body,
  );
  return data;
};

export const updateDoctorService = async (
  id: number,
  body: DoctorServiceWrite,
): Promise<DoctorServiceItem> => {
  const { data } = await apiClient.put<DoctorServiceItem>(
    `/api/doctor/services/${id}/`,
    body,
  );
  return data;
};

export const deleteDoctorService = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/doctor/services/${id}/`);
};
