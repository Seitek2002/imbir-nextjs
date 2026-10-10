import { toHttps, toMediaUrl } from "@/shared/lib/media";

import { FILE_UPLOAD_TIMEOUT_MS, apiClient } from "../client";
import {
  fetchAllPages,
  fetchAppointmentsNewestFirst,
} from "../doctor-cabinet/requests";
import type { DoctorAppointment } from "../doctor-cabinet/types";
import type { PaginatedReviewsResponse, ReviewItem } from "../reviews/types";
import { withCategoryTitle } from "../services/requests";
import { PaginatedResponse } from "../types";
import {
  ClinicAppointmentFilters,
  ClinicDoctorItem,
  ClinicDoctorProfile,
  ClinicDoctorProfileBody,
  ClinicDocument,
  ClinicPhoto,
  ClinicPrivateProfile,
  ClinicProfileBranch,
  ClinicServiceBody,
  ClinicServiceDetail,
  ClinicServiceListItem,
  ClinicStats,
  CreateClinicDoctorRequest,
  CreateInviteRequest,
  InviteLink,
  UpdateBranchRequest,
} from "./types";

const sendMultipart = async <T>(
  path: string,
  method: "PATCH" | "POST" | "PUT",
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
  additional_services?: string;
  address?: string;
  city?: string;
  clinic_type?: string;
  country?: string;
  description?: string;
  emergency_24_7?: boolean;
  equipment?: string[];
  experience_years?: number;
  latitude?: null | string;
  legal_name?: string;
  license_authority?: string;
  license_date?: null | string;
  license_number?: string;
  logo?: File | null | string;
  longitude?: null | string;
  lunch_break?: { from: string; to: string };
  name?: string;
  narrow_specialization_ids?: number[];
  patient_conditions?: string[];
  payment_methods?: string[];
  phone?: string;
  // Бэк принимает на запись только id (проверено живым запросом: массив
  // названий строк молча очищает специализации клиники, без ошибки).
  primary_specialization_ids?: number[];
  reg_number?: string;
  schedule?: Record<
    string,
    { enabled: boolean; from: null | string; to: null | string }
  >;
  website?: string;
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

const splitFiles = (body: Record<string, unknown>) => {
  const files: [string, File][] = [];
  const rest: Record<string, unknown> = {};
  Object.entries(body).forEach(([key, value]) => {
    if (value instanceof File) files.push([key, value]);
    else if (value !== undefined) rest[key] = value;
  });
  return { files, rest };
};

const sendJson = async <T>(
  path: string,
  method: "PATCH" | "POST" | "PUT",
  body: Record<string, unknown>,
): Promise<T> => {
  const { data } = await apiClient.request<T>({
    url: path,
    method,
    data: body,
  });
  return data;
};

// Файл в теле требует multipart, без файла — обычный JSON.
// При правке (PATCH/PUT — на бэке это всегда частичное обновление) данные и
// файл уходят раздельно: сначала JSON, затем multipart только с файлом. В
// multipart нельзя передать «очистить»: null и [] там просто пропадали, бэк
// оставлял старое значение и отвечал успехом — при смене фото не снимались
// врачи процедуры, доп. специализация, языки, оборудование, дата рождения.
// POST создаёт запись с нуля, очищать там нечего — он идёт одним multipart.
const sendMaybeMultipart = async <T>(
  path: string,
  method: "PATCH" | "POST" | "PUT",
  body: Record<string, unknown>,
): Promise<T> => {
  const { files, rest } = splitFiles(body);

  if (files.length === 0) return sendJson<T>(path, method, body);

  if (method === "POST") {
    const form = new FormData();
    Object.entries(body).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      appendMultipart(form, key, value);
    });
    return sendMultipart<T>(path, method, form);
  }

  if (Object.keys(rest).length > 0) await sendJson<T>(path, method, rest);
  const form = new FormData();
  files.forEach(([key, file]) => form.append(key, file));
  return sendMultipart<T>(path, method, form);
};

export const updateClinicProfile = async (
  body: UpdateClinicProfileBody,
): Promise<ClinicPrivateProfile> =>
  // Логотип (File) требует multipart; правила упаковки — в appendMultipart выше.
  sendMaybeMultipart<ClinicPrivateProfile>("/api/clinic/profile/", "PUT", body);

// Название филиала, а если его не задали — адрес: у заведённых через админку
// филиалов имя часто пустое (в карточке процедуры из-за этого стояло «—»).
export const branchLabel = (
  branch: Pick<ClinicProfileBranch, "address" | "id" | "name">,
): string =>
  branch.name?.trim() || branch.address?.trim() || `Филиал #${branch.id}`;

export const createClinicBranch = async (
  body: UpdateBranchRequest,
): Promise<ClinicProfileBranch> => {
  const { data } = await apiClient.post<ClinicProfileBranch>(
    "/api/clinic/branches/",
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

// Привязки врачей, инвайты и процедуры филиала при удалении остаются — бэк
// просто снимает у них филиал (SET_NULL).
export const deleteClinicBranch = async (branchId: number): Promise<void> => {
  await apiClient.delete(`/api/clinic/branches/${branchId}/`);
};

const asCollection = <T>(data: null | T | T[] | undefined): T[] => {
  if (!data) return [];
  return Array.isArray(data) ? data : [data];
};

export const getClinicDocuments = async (): Promise<ClinicDocument[]> => {
  const { data } = await apiClient.get<ClinicDocument | ClinicDocument[]>(
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
  const { data } = await apiClient.get<ClinicPhoto | ClinicPhoto[]>(
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
// Профильные поля бэк принимает тем же запросом — врача можно завести сразу с
// заполненной карточкой. Фото уходит вторым запросом (PATCH карточки): в
// multipart языки и образование доходили до бэка одной JSON-строкой внутри
// списка. Если не загрузилось только фото, врач уже создан — повторное
// создание упёрлось бы в «почта занята», поэтому ошибку фото возвращаем
// отдельно (photoError), а не бросаем.
export const createClinicDoctor = async (
  body: CreateClinicDoctorRequest,
): Promise<ClinicDoctorItem & { photoError?: unknown }> => {
  const { photo, ...rest } = body;
  const created = await sendJson<ClinicDoctorItem>(
    "/api/clinic/doctors/",
    "POST",
    photo instanceof File ? rest : body,
  );
  if (!(photo instanceof File)) return created;
  try {
    const updated = await updateClinicDoctor(created.id, { photo });
    return { ...created, photo: updated.photo };
  } catch (photoError) {
    return { ...created, photoError };
  }
};

export const detachClinicDoctor = async (doctorId: number): Promise<void> => {
  await apiClient.delete(`/api/clinic/doctors/${doctorId}/`);
};

const withHttpsPhoto = <T extends { photo?: null | string }>(item: T): T => ({
  ...item,
  photo: toHttps(item.photo ?? null) ?? null,
});

// Полная карточка прикреплённого врача. Раньше этой ручки не было вообще —
// страница врача собиралась из общего списка и публичной карточки.
export const getClinicDoctor = async (
  doctorId: number,
): Promise<ClinicDoctorProfile> => {
  const { data } = await apiClient.get<ClinicDoctorProfile>(
    `/api/clinic/doctors/${doctorId}/`,
  );
  return withHttpsPhoto(data);
};

// PATCH, а не PUT: бэк принимает частичное обновление, и слать целиком всю
// карточку ради одного поля не нужно (в отличие от PUT /api/clinic/profile/,
// который стирает всё непереданное).
export const updateClinicDoctor = async (
  doctorId: number,
  body: ClinicDoctorProfileBody,
): Promise<ClinicDoctorProfile> => {
  const data = await sendMaybeMultipart<ClinicDoctorProfile>(
    `/api/clinic/doctors/${doctorId}/`,
    "PATCH",
    body,
  );
  return withHttpsPhoto(data);
};

export const getClinicDoctorDocuments = async (
  doctorId: number,
): Promise<ClinicDocument[]> => {
  const { data } = await apiClient.get<ClinicDocument | ClinicDocument[]>(
    `/api/clinic/doctors/${doctorId}/documents/`,
  );
  return asCollection(data);
};

export const uploadClinicDoctorDocument = async (
  doctorId: number,
  file: File,
): Promise<ClinicDocument> => {
  const form = new FormData();
  form.append("file", file);
  return sendMultipart<ClinicDocument>(
    `/api/clinic/doctors/${doctorId}/documents/`,
    "POST",
    form,
  );
};

export const deleteClinicDoctorDocument = async (
  doctorId: number,
  documentId: number,
): Promise<void> => {
  await apiClient.delete(
    `/api/clinic/doctors/${doctorId}/documents/${documentId}/`,
  );
};

export const getClinicServices = async (): Promise<
  PaginatedResponse<ClinicServiceListItem>
> => {
  const { data } = await apiClient.get<
    PaginatedResponse<ClinicServiceListItem>
  >("/api/clinic/services/", { params: { page_size: CABINET_PAGE_SIZE } });
  return {
    ...data,
    data: data.data.map((service) => ({
      ...withCategoryTitle(service),
      photo: toMediaUrl(service.photo) ?? null,
    })),
  };
};

// Полная карточка процедуры. Раньше ручки не было и страница редактирования
// искала запись в общем списке — теперь читаем напрямую.
export const getClinicService = async (
  id: number,
): Promise<ClinicServiceDetail> => {
  const { data } = await apiClient.get<ClinicServiceDetail>(
    `/api/clinic/services/${id}/`,
  );
  return { ...withCategoryTitle(data), photo: toHttps(data.photo) ?? null };
};

export const addClinicService = async (
  body: ClinicServiceBody,
): Promise<ClinicServiceListItem> =>
  // photo может быть File — тогда уходит multipart'ом (см. sendMaybeMultipart).
  sendMaybeMultipart<ClinicServiceListItem>(
    "/api/clinic/services/",
    "POST",
    body,
  );

// Длительность, цену, врачей и филиал очищают null'ом / []. С новым фото
// данные всё равно уходят JSON'ом отдельно от файла (см. sendMaybeMultipart),
// поэтому очистка срабатывает и вместе со сменой фото.
export const updateClinicService = async (
  id: number,
  body: ClinicServiceBody,
): Promise<ClinicServiceListItem> =>
  sendMaybeMultipart<ClinicServiceListItem>(
    `/api/clinic/services/${id}/`,
    "PUT",
    body,
  );

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

// Для списка в кабинете: все страницы, новые записи первыми (см.
// fetchAppointmentsNewestFirst). getClinicAppointments выше остаётся для
// счётчика ожидающих — ему нужна одна страница с pagination.total.
export const getClinicAppointmentsNewestFirst = (
  filters: ClinicAppointmentFilters = {},
) => fetchAppointmentsNewestFirst("/api/clinic/appointments/", filters);

// Ответ плоский (без обёртки data) — проверено живым запросом.
export const getClinicStats = async (): Promise<ClinicStats> => {
  const { data } = await apiClient.get<ClinicStats>("/api/clinic/stats/");
  return data;
};

// Все отзывы, а не первые 20: иначе на старые нельзя было ответить.
export const getClinicReviews = (): Promise<PaginatedReviewsResponse> =>
  fetchAllPages<ReviewItem>("/api/clinic/reviews/");

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
