import { FILE_UPLOAD_TIMEOUT_MS, apiClient } from "../client";
import type { PaginatedReviewsResponse } from "../reviews/types";
import { PaginatedResponse } from "../types";
import {
  DoctorAppointment,
  DoctorAppointmentFilters,
  DoctorAppointmentSummary,
  DoctorDocument,
  DoctorPatient,
  DoctorPatientFilters,
  DoctorPrivateProfile,
  DoctorSchedule,
  DoctorServiceBody,
  DoctorServiceItem,
  DoctorStats,
} from "./types";

export const getDoctorProfile = async (): Promise<DoctorPrivateProfile> => {
  const { data } = await apiClient.get<DoctorPrivateProfile>(
    "/api/doctor/profile/",
  );
  return data;
};

// Писчие поля PUT /api/doctor/profile/ (схема DoctorOwnProfileRequest).
// Заданы явно, т.к. DoctorPrivateProfile унаследован от публичного типа и
// рассинхронизирован с реальным ответом бэка (first_name/last_name, gender...).
export type UpdateDoctorProfileBody = {
  about?: string;
  academic_degree?: string;
  additional_education?: { name: string; year?: number | null }[];
  additional_services?: string;
  address?: string;
  birth_date?: null | string;
  city?: string;
  // Строка, а не число: бэк отдаёт и принимает decimal как "1500.00".
  consultation_price?: string;
  country?: string;
  education?: unknown[];
  equipment?: string[];
  experience_years?: number;
  first_name?: string;
  gender?: string;
  position?: string;
  qualification_category?: string;
  // Схема DoctorOwnProfileRequest принимает эти три поля на запись (проверено
  // живым PUT). Без них врач, зарегистрировавшийся сам, не мог ни включить
  // онлайн-приём, ни опубликоваться — оставался невидимым в каталоге до
  // правки в админке.
  is_online_available?: boolean;
  is_published?: boolean;
  languages?: string[];
  last_name?: string;
  legal_name?: string;
  license_authority?: string;
  license_date?: null | string;
  license_number?: string;
  narrow_specialization_ids?: number[];
  patient_conditions?: string[];
  payment_methods?: string[];
  phone?: string;
  photo?: File | null | string;
  // Бэк принимает на запись только id (проверено живым запросом: массив
  // названий строк молча очищает специализации врача, без ошибки).
  primary_specialization_ids?: number[];
  reg_number?: string;
  skills?: string[];
  website?: string;
  work_experience?: unknown[];
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

// Если есть файл (фото) — шлём multipart, иначе обычный JSON. Правила
// упаковки полей в multipart — в appendMultipart выше.
const sendMaybeMultipart = async <T>(
  path: string,
  method: "PATCH" | "POST" | "PUT",
  body: Record<string, unknown>,
): Promise<T> => {
  const hasFile = Object.values(body).some((v) => v instanceof File);

  if (hasFile) {
    const form = new FormData();
    Object.entries(body).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      appendMultipart(form, key, value);
    });
    const { data } = await apiClient.request<T>({
      url: path,
      method,
      data: form,
      // Файлы не укладываются в общие 15 секунд на медленном канале.
      timeout: FILE_UPLOAD_TIMEOUT_MS,
    });
    return data;
  }

  const { data } = await apiClient.request<T>({
    url: path,
    method,
    data: body,
  });
  return data;
};

export const updateDoctorProfile = async (
  body: UpdateDoctorProfileBody,
): Promise<DoctorPrivateProfile> =>
  sendMaybeMultipart<DoctorPrivateProfile>("/api/doctor/profile/", "PUT", body);

// Ответ плоский ({schedule, lunch_break, emergency_24_7}), без обёртки data —
// проверено живым запросом.
export const getDoctorSchedule = async (): Promise<DoctorSchedule> => {
  const { data } = await apiClient.get<DoctorSchedule>("/api/doctor/schedule/");
  return data;
};

export const updateDoctorSchedule = async (
  body: DoctorSchedule,
): Promise<DoctorSchedule> => {
  const { data } = await apiClient.put<DoctorSchedule>(
    "/api/doctor/schedule/",
    body,
  );
  return data;
};

export const getDoctorAppointments = async (
  filters: DoctorAppointmentFilters = {},
): Promise<PaginatedResponse<DoctorAppointment>> => {
  const { data } = await apiClient.get<PaginatedResponse<DoctorAppointment>>(
    "/api/doctor/appointments/",
    { params: filters },
  );
  return data;
};

export const getDoctorPatients = async (
  filters: DoctorPatientFilters = {},
): Promise<PaginatedResponse<DoctorPatient>> => {
  const { data } = await apiClient.get<PaginatedResponse<DoctorPatient>>(
    "/api/doctor/patients/",
    { params: filters },
  );
  return data;
};

// Итоги приёма: диагноз/рекомендации/заметки врача по конкретной записи.
export const getAppointmentSummary = async (
  id: number,
): Promise<DoctorAppointmentSummary> => {
  const { data } = await apiClient.get<DoctorAppointmentSummary>(
    `/api/doctor/appointments/${id}/summary/`,
  );
  return data;
};

export const updateAppointmentSummary = async (
  id: number,
  body: Partial<DoctorAppointmentSummary>,
): Promise<DoctorAppointmentSummary> => {
  const { data } = await apiClient.patch<DoctorAppointmentSummary>(
    `/api/doctor/appointments/${id}/summary/`,
    body,
  );
  return data;
};

// Ответ плоский (без обёртки data) — проверено живым запросом.
export const getDoctorStats = async (): Promise<DoctorStats> => {
  const { data } = await apiClient.get<DoctorStats>("/api/doctor/stats/");
  return data;
};

export const getDoctorReviews = async (): Promise<PaginatedReviewsResponse> => {
  const { data } = await apiClient.get<PaginatedReviewsResponse>(
    "/api/doctor/reviews/",
  );
  return data;
};

export const getDoctorServices = async (): Promise<{
  data: DoctorServiceItem[];
}> => {
  const { data } = await apiClient.get<{ data: DoctorServiceItem[] }>(
    "/api/doctor/services/",
  );
  return data;
};

export const addDoctorService = async (
  body: DoctorServiceBody,
): Promise<DoctorServiceItem> =>
  // photo может быть File — тогда уходит multipart'ом.
  sendMaybeMultipart<DoctorServiceItem>("/api/doctor/services/", "POST", body);

export const deleteDoctorService = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/doctor/services/${id}/`);
};

// ── Документы и сертификаты врача ───────────────────────────────────────────
// Профильный endpoint файлы сертификатов не принимает (в схеме
// DoctorOwnProfileRequest поля documents вообще нет) — для них есть отдельный
// /api/doctor/documents/. До этого он не использовался нигде: регистрация
// сертификаты молча теряла, а кабинет показывал захардкоженный пустой список.

export const getDoctorDocuments = async (): Promise<DoctorDocument[]> => {
  const { data } = await apiClient.get<
    { data: DoctorDocument[] } | DoctorDocument[]
  >("/api/doctor/documents/");
  // Бэк по одним эндпоинтам отдаёт массив, по другим — { data: [...] }.
  return Array.isArray(data) ? data : (data.data ?? []);
};

export const uploadDoctorDocument = async (
  file: File,
): Promise<DoctorDocument> => {
  const form = new FormData();
  form.append("file", file);
  // Напрямую, без прокси /backend-api: Next не настроен на trailingSlash и
  // редиректил /backend-api/.../documents/ на адрес без слэша (308). POST при
  // таком редиректе терял тело, и бэк отвечал 500. CORS у API открыт
  // (Allow-Origin: *, POST и authorization разрешены — проверено preflight),
  // так что прокси тут и не нужен.
  const { data } = await apiClient.post<DoctorDocument>(
    "/api/doctor/documents/",
    form,
    { timeout: FILE_UPLOAD_TIMEOUT_MS },
  );
  return data;
};

export const deleteDoctorDocument = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/doctor/documents/${id}/`);
};
