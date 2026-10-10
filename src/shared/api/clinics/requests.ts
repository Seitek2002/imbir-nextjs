import { apiClient } from "../client";
import { PaginatedResponse } from "../types";
import { ClinicDetail, ClinicFilters, ClinicListItem } from "./types";

export const getClinics = async (
  filters: ClinicFilters = {},
  signal?: AbortSignal,
): Promise<PaginatedResponse<ClinicListItem>> => {
  const { data } = await apiClient.get<PaginatedResponse<ClinicListItem>>(
    "/api/clinics/",
    { params: filters, signal },
  );
  return data;
};

export const getClinicById = async (
  id: number | string,
): Promise<ClinicDetail> => {
  const { data } = await apiClient.get<ClinicDetail>(`/api/clinics/${id}/`);
  return data;
};

// Засчитать просмотр страницы клиники — см. trackDoctorProfileView.
export const trackClinicProfileView = async (
  id: number | string,
): Promise<void> => {
  await apiClient.post(`/api/clinics/${id}/view/`);
};
