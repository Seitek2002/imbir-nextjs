import { apiClient } from "../client";
import { PaginatedResponse } from "../types";
import {
  AvailableSlotsResponse,
  DoctorDetail,
  DoctorFilters,
  DoctorListItem,
} from "./types";

export const getDoctors = async (
  filters: DoctorFilters = {},
  signal?: AbortSignal,
): Promise<PaginatedResponse<DoctorListItem>> => {
  const { data } = await apiClient.get<PaginatedResponse<DoctorListItem>>(
    "/api/doctors/",
    { params: filters, signal },
  );
  return data;
};

export const getDoctorById = async (
  id: string | number,
): Promise<DoctorDetail> => {
  const { data } = await apiClient.get<DoctorDetail>(`/api/doctors/${id}/`);
  return data;
};

export const getDoctorAvailableSlots = async (
  id: string | number,
  date: string,
  service_id?: string | number | null,
): Promise<AvailableSlotsResponse> => {
  const { data } = await apiClient.get<AvailableSlotsResponse>(
    `/api/doctors/${id}/available-slots/`,
    { params: { date, ...(service_id ? { service_id } : {}) } },
  );
  return data;
};
