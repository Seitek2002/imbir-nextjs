import { apiClient } from "../client";
import {
  CountryCode,
  CountryCodesResponse,
  ReferenceListResponse,
  SpecializationItem,
  SpecializationListResponse,
  UserAccountStatus,
  UserAccountStatusResponse,
} from "./types";

const fetchReference = async (path: string): Promise<string[]> => {
  const { data } = await apiClient.get<ReferenceListResponse>(path);
  return data.data;
};

// Список телефонных кодов стран — объекты { code, country, flag, iso },
// в отличие от остальных справочников (там просто string[]).
export const getCountryCodes = async (): Promise<CountryCode[]> => {
  const { data } = await apiClient.get<CountryCodesResponse>(
    "/api/references/country-codes/",
  );
  return data.data;
};

export const getCities = () => fetchReference("/api/references/cities/");

// Единственный справочник, отдающий объекты, а не строки — с id и photo
// (бэк подвёз миграцию значений и картинки после нашей просьбы).
export const getSpecializations = async (): Promise<SpecializationItem[]> => {
  const { data } = await apiClient.get<SpecializationListResponse>(
    "/api/references/specializations/",
  );
  return data.data;
};

export const getClinicTypes = () =>
  fetchReference("/api/references/clinic-types/");
export const getLanguages = () => fetchReference("/api/references/languages/");
export const getEquipment = () => fetchReference("/api/references/equipment/");
export const getConditions = () =>
  fetchReference("/api/references/conditions/");
export const getPaymentMethods = () =>
  fetchReference("/api/references/payment-methods/");

// Появился после нашей просьбы — раньше оба кандидата отвечали 404, и
// категории собирались на фронте из реальных услуг (см. entities/service).
export const getServiceCategories = () =>
  fetchReference("/api/references/service-categories/");

export const getUserStatus = async (
  userId: number,
): Promise<UserAccountStatus> => {
  const { data } = await apiClient.get<UserAccountStatusResponse>(
    `/api/references/user-status/${userId}/`,
  );
  return data.data;
};
