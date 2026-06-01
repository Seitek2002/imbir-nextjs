import { apiClient } from "../client";
import { PaginatedResponse } from "../types";
import { ClinicDetail, ClinicFilters, ClinicListItem } from "./types";

export const getClinics = async (
  filters: ClinicFilters = {},
): Promise<PaginatedResponse<ClinicListItem>> => {
  const { data } = await apiClient.get<PaginatedResponse<ClinicListItem>>(
    "/api/clinics/",
    { params: filters },
  );
  return data;
};

export const getClinicById = async (
  id: string | number,
): Promise<ClinicDetail> => {
  const { data } = await apiClient.get<ClinicDetail>(`/api/clinics/${id}/`);
  return data;
};
