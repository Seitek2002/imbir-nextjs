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
  id: number | string,
): Promise<DoctorDetail> => {
  const { data } = await apiClient.get<DoctorDetail>(`/api/doctors/${id}/`);
  return data;
};

export const getDoctorAvailableSlots = async (
  id: number | string,
  date: string,
  service_id?: null | number | string,
): Promise<AvailableSlotsResponse> => {
  const { data } = await apiClient.get<AvailableSlotsResponse>(
    `/api/doctors/${id}/available-slots/`,
    { params: { date, ...(service_id ? { service_id } : {}) } },
  );
  return data;
};
