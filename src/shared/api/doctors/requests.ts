import { apiClient } from "../client";
import { PaginatedResponse } from "../types";
import { DoctorDetail, DoctorFilters, DoctorListItem } from "./types";

export const getDoctors = async (
  filters: DoctorFilters = {},
): Promise<PaginatedResponse<DoctorListItem>> => {
  const { data } = await apiClient.get<PaginatedResponse<DoctorListItem>>(
    "/api/doctors/",
    { params: filters },
  );
  return data;
};

export const getDoctorById = async (
  id: string | number,
): Promise<DoctorDetail> => {
  const { data } = await apiClient.get<DoctorDetail>(`/api/doctors/${id}/`);
  return data;
};
