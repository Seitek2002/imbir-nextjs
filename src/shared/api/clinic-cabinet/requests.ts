import { toHttps } from "@/shared/lib/media";

import { apiClient } from "../client";
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
  schedule?: Record<string, { from: string; to: string; enabled: boolean }>;
  lunch_break?: { from: string; to: string };
};

export const updateClinicProfile = async (
  body: UpdateClinicProfileBody,
): Promise<ClinicPrivateProfile> => {
  // Логотип (File) требует multipart; массивы/объекты сериализуем в JSON-строку.
  const hasFile = Object.values(body).some((v) => v instanceof File);

  if (hasFile) {
    const form = new FormData();
    Object.entries(body).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (value instanceof File) form.append(key, value);
      else if (typeof value === "object")
        form.append(key, JSON.stringify(value));
      else form.append(key, String(value));
    });
    const { data } = await apiClient.put<ClinicPrivateProfile>(
      "/api/clinic/profile/",
      form,
    );
    return data;
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
  const { data } = await apiClient.post<ClinicDocument>(
    "/api/clinic/documents/",
    form,
  );
  return data;
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
  const { data } = await apiClient.post<ClinicPhoto>(
    "/api/clinic/photos/",
    form,
  );
  return data;
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
