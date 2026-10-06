import { apiClient } from "../client";
import { PaginatedResponse } from "../types";
import {
  ServiceCategoryRef,
  ServiceDetail,
  ServiceFilters,
  ServiceListItem,
} from "./types";

// Категория услуги переезжает из свободного текста (category) в справочник
// (service_category). Старые услуги пока без записи в справочнике, поэтому
// показываем её название, а если его нет — прежний текст.
export const withCategoryTitle = <
  T extends { category: string; service_category?: null | ServiceCategoryRef },
>(
  service: T,
): T =>
  service.service_category?.title
    ? { ...service, category: service.service_category.title }
    : service;

type ServiceCategoryPage = {
  data: ServiceCategoryRef[];
  pagination?: { page: number; total_pages: number };
};

// Справочник небольшой: забираем целиком страницами по 100 и ищем по нему
// на клиенте — так же, как в остальных выпадающих списках форм.
export const getServiceCategoryList = async (): Promise<
  ServiceCategoryRef[]
> => {
  const all: ServiceCategoryRef[] = [];
  for (let page = 1; page <= 20; page++) {
    const { data } = await apiClient.get<ServiceCategoryPage>(
      "/api/service-categories/",
      { params: { page, page_size: 100 } },
    );
    all.push(...data.data);
    if (!data.pagination || page >= data.pagination.total_pages) break;
  }
  return all;
};

export const getServices = async (
  filters: ServiceFilters = {},
  signal?: AbortSignal,
): Promise<PaginatedResponse<ServiceListItem>> => {
  const { data } = await apiClient.get<PaginatedResponse<ServiceListItem>>(
    "/api/services/",
    { params: filters, signal },
  );
  return { ...data, data: data.data.map(withCategoryTitle) };
};

export const getServiceById = async (
  id: number | string,
): Promise<ServiceDetail> => {
  const { data } = await apiClient.get<ServiceDetail>(`/api/services/${id}/`);
  return withCategoryTitle(data);
};
