import { apiClient } from "../client";
import {
  CountryCode,
  CountryCodesResponse,
  ReferenceListResponse,
} from "./types";

const fetchReference = async (
  path: string,
): Promise<
  {
    id: number;
    name: string;
    photo?: string;
  }[]
> => {
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
export const getSpecializations = () =>
  fetchReference("/api/references/specializations/");
export const getClinicTypes = () =>
  fetchReference("/api/references/clinic-types/");
export const getLanguages = () => fetchReference("/api/references/languages/");
export const getEquipment = () => fetchReference("/api/references/equipment/");
export const getConditions = () =>
  fetchReference("/api/references/conditions/");
export const getPaymentMethods = () =>
  fetchReference("/api/references/payment-methods/");
