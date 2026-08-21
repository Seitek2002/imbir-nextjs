import { toHttps } from "@/shared/lib/media";

import { FILE_UPLOAD_TIMEOUT_MS, apiClient } from "../client";
import type { DoctorAppointment } from "../doctor-cabinet/types";
import type { PaginatedReviewsResponse } from "../reviews/types";
import { PaginatedResponse } from "../types";
import {
  ClinicAppointmentFilters,
  ClinicDoctorItem,
  ClinicDocument,
  ClinicPhoto,
  ClinicPrivateProfile,
  ClinicServiceBody,
  ClinicServiceListItem,
  ClinicStats,
  CreateClinicDoctorRequest,
  CreateInviteRequest,
  InviteLink,
  UpdateBranchRequest,
} from "./types";

const sendMultipart = async <T>(
  path: string,
  method: "POST" | "PUT",
  form: FormData,
): Promise<T> => {
  // Без прокси /backend-api: у Next trailingSlash выключен, и он редиректил
  // путь со слэшем на адрес без него (308) — POST при этом терял тело, а бэк
  // отвечал 500. CORS у API открыт, прямой multipart проходит.
  const { data } = await apiClient.request<T>({
    url: path,
    method,
    data: form,
    // Файлы не укладываются в общие 15 секунд на медленном канале.
    timeout: FILE_UPLOAD_TIMEOUT_MS,
  });
  return data;
};

export const getClinicProfile = async (): Promise<ClinicPrivateProfile> => {
  const { data } = await apiClient.get<ClinicPrivateProfile>(
    "/api/clinic/profile/",
  );
  return { ...data, logo: toHttps(data.logo) ?? null };
};

// Писчие поля PUT /api/clinic/profile/ (схема ClinicOwnProfileRequest).
// Заданы явно: ClinicPrivateProfile унаследован от публичного типа и
// не совпадает с реальным ответом (description, logo-binary и т.д.).
export type UpdateClinicProfileBody = {
  name?: string;
  clinic_type?: string;
  description?: string;
  logo?: File | string | null;
  phone?: string;
  website?: string;
  country?: string;
  city?: string;
  address?: string;
  latitude?: string;
  longitude?: string;
  legal_name?: string;
  reg_number?: string;
  license_number?: string;
  license_date?: string | null;
  license_authority?: string;
  // Бэк принимает на запись только id (проверено живым запросом: массив
  // названий строк молча очищает специализации клиники, без ошибки).
  primary_specialization_ids?: number[];
  narrow_specialization_ids?: number[];
  additional_services?: string;
  equipment?: string[];
  patient_conditions?: string[];
  payment_methods?: string[];
  emergency_24_7?: boolean;
  schedule?: Record<
    string,
    { from: string | null; to: string | null; enabled: boolean }
  >;
  lunch_break?: { from: string; to: string };
};

// Массив чисел в multipart нельзя слать JSON-строкой: DRF ждёт по одному
// значению на поле и на "[1,9]" отвечает «Ожидалось значение первичного ключа,
// получен str». Из-за этого весь PUT падал с 400, и вместе со
// специализациями терялись стаж, образование и опыт работы — всё, что шло
// тем же запросом. Массивы строк (languages, equipment) бэк как JSON
// принимает, их не трогаем.
const appendMultipart = (form: FormData, key: string, value: unknown) => {
  if (value instanceof File) return form.append(key, value);
  if (Array.isArray(value) && value.every((v) => typeof v === "number")) {
    value.forEach((v) => form.append(key, String(v)));
    return;
  }
  if (typeof value === "object" && value !== null)
    return form.append(key, JSON.stringify(value));
  form.append(key, String(value));
};

export const updateClinicProfile = async (
  body: UpdateClinicProfileBody,
): Promise<ClinicPrivateProfile> => {
  // Логотип (File) требует multipart; правила упаковки — в appendMultipart выше.
  const hasFile = Object.values(body).some((v) => v instanceof File);

  if (hasFile) {
    const form = new FormData();
    Object.entries(body).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      appendMultipart(form, key, value);
    });
    return sendMultipart<ClinicPrivateProfile>(
      "/api/clinic/profile/",
      "PUT",
      form,
    );
  }

  const { data } = await apiClient.put<ClinicPrivateProfile>(
    "/api/clinic/profile/",
    body,
  );
  return data;
};

export const updateClinicBranch = async (
  branchId: string,
  body: UpdateBranchRequest,
): Promise<void> => {
  await apiClient.put(`/api/clinic/branches/${branchId}/`, body);
};

const asCollection = <T>(data: T | T[] | null | undefined): T[] => {
  if (!data) return [];
  return Array.isArray(data) ? data : [data];
};

export const getClinicDocuments = async (): Promise<ClinicDocument[]> => {
  const { data } = await apiClient.get<ClinicDocument[] | ClinicDocument>(
    "/api/clinic/documents/",
  );
  return asCollection(data);
};

export const uploadClinicDocument = async (
  file: File,
): Promise<ClinicDocument> => {
  const form = new FormData();
  form.append("file", file);
  return sendMultipart<ClinicDocument>("/api/clinic/documents/", "POST", form);
};

export const deleteClinicDocument = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/clinic/documents/${id}/`);
};

export const getClinicPhotos = async (): Promise<ClinicPhoto[]> => {
  const { data } = await apiClient.get<ClinicPhoto[] | ClinicPhoto>(
    "/api/clinic/photos/",
  );
  return asCollection(data);
};

export const uploadClinicPhoto = async (file: File): Promise<ClinicPhoto> => {
  const form = new FormData();
  form.append("file", file);
  return sendMultipart<ClinicPhoto>("/api/clinic/photos/", "POST", form);
};

export const deleteClinicPhoto = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/clinic/photos/${id}/`);
};

// Списки кабинета пагинированы (по умолчанию бэк отдаёт page_size=20), а UI
// показывает их одним списком без пагинации. Без явного page_size клиника с
// 21+ врачом молча теряла бы хвост. 100 — потолок бэка: page_size=500 он
// приводит к 100.
const CABINET_PAGE_SIZE = 100;

export const getClinicDoctors = async (): Promise<
  PaginatedResponse<ClinicDoctorItem>
> => {
  const { data } = await apiClient.get<PaginatedResponse<ClinicDoctorItem>>(
    "/api/clinic/doctors/",
    { params: { page_size: CABINET_PAGE_SIZE } },
  );
  return {
    ...data,
    data: data.data.map((d) => ({ ...d, photo: toHttps(d.photo) ?? null })),
  };
};

// Регистрация врача клиникой из кабинета. Создаёт User(role=doctor) +
// DoctorProfile (город/страна клиники) + DoctorClinicLink. Почта и телефон
// должны быть уникальны (иначе 400).
export const createClinicDoctor = async (
  body: CreateClinicDoctorRequest,
): Promise<ClinicDoctorItem> => {
  const { data } = await apiClient.post<ClinicDoctorItem>(
    "/api/clinic/doctors/",
    body,
  );
  return data;
};

export const detachClinicDoctor = async (doctorId: number): Promise<void> => {
  await apiClient.delete(`/api/clinic/doctors/${doctorId}/`);
};

export const getClinicServices = async (): Promise<
  PaginatedResponse<ClinicServiceListItem>
> => {
  const { data } = await apiClient.get<
    PaginatedResponse<ClinicServiceListItem>
  >("/api/clinic/services/", { params: { page_size: CABINET_PAGE_SIZE } });
  return data;
};

export const addClinicService = async (
  body: ClinicServiceBody,
): Promise<ClinicServiceListItem> => {
  const { data } = await apiClient.post<ClinicServiceListItem>(
    "/api/clinic/services/",
    body,
  );
  return data;
};

export const updateClinicService = async (
  id: number,
  body: ClinicServiceBody,
): Promise<ClinicServiceListItem> => {
  const { data } = await apiClient.put<ClinicServiceListItem>(
    `/api/clinic/services/${id}/`,
    body,
  );
  return data;
};

export const deleteClinicService = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/clinic/services/${id}/`);
};

export const getClinicAppointments = async (
  filters: ClinicAppointmentFilters = {},
): Promise<PaginatedResponse<DoctorAppointment>> => {
  const { data } = await apiClient.get<PaginatedResponse<DoctorAppointment>>(
    "/api/clinic/appointments/",
    { params: filters },
  );
  return data;
};

// Ответ плоский (без обёртки data) — проверено живым запросом.
export const getClinicStats = async (): Promise<ClinicStats> => {
  const { data } = await apiClient.get<ClinicStats>("/api/clinic/stats/");
  return data;
};

export const getClinicReviews = async (): Promise<PaginatedReviewsResponse> => {
  const { data } = await apiClient.get<PaginatedReviewsResponse>(
    "/api/clinic/reviews/",
  );
  return data;
};

export const getClinicInvites = async (): Promise<InviteLink[]> => {
  const { data } = await apiClient.get<InviteLink[]>("/api/clinic/invites/");
  return data;
};

export const createClinicInvite = async (
  body: CreateInviteRequest = {},
): Promise<InviteLink> => {
  const { data } = await apiClient.post<InviteLink>(
    "/api/clinic/invites/",
    body,
  );
  return data;
};

export const deleteClinicInvite = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/clinic/invites/${id}/`);
};
