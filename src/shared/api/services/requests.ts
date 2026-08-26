import { apiClient } from "../client";
import { PaginatedResponse } from "../types";
import { ServiceDetail, ServiceFilters, ServiceListItem } from "./types";

export const getServices = async (
  filters: ServiceFilters = {},
  signal?: AbortSignal,
): Promise<PaginatedResponse<ServiceListItem>> => {
  const { data } = await apiClient.get<PaginatedResponse<ServiceListItem>>(
    "/api/services/",
    { params: filters, signal },
  );
  return data;
};

export const getServiceById = async (
  id: number | string,
): Promise<ServiceDetail> => {
  const { data } = await apiClient.get<ServiceDetail>(`/api/services/${id}/`);
  return data;
};
