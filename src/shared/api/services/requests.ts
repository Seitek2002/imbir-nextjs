import { apiClient } from "../client";
import { PaginatedResponse } from "../types";
import { ServiceDetail, ServiceFilters, ServiceListItem } from "./types";

export const getServices = async (
  filters: ServiceFilters = {},
): Promise<PaginatedResponse<ServiceListItem>> => {
  const { data } = await apiClient.get<PaginatedResponse<ServiceListItem>>(
    "/api/services/",
    { params: filters },
  );
  return data;
};

export const getServiceById = async (
  id: string | number,
): Promise<ServiceDetail> => {
  const { data } = await apiClient.get<ServiceDetail>(`/api/services/${id}/`);
  return data;
};
