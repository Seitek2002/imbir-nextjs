import { apiClient } from "../client";
import { PaginatedResponse } from "../types";
import {
  AvailableDatesResponse,
  AvailableSlotsResponse,
  DoctorDetail,
  DoctorFilters,
  DoctorListItem,
} from "./types";

export const getDoctors = async (
  filters: DoctorFilters = {},
  signal?: AbortSignal,
): Promise<PaginatedResponse<DoctorListItem>> => {
  const { data } = await apiClient.get<PaginatedResponse<DoctorListItem>>(
    "/api/doctors/",
    { params: filters, signal },
  );
  return data;
};

export const getDoctorById = async (
  id: number | string,
): Promise<DoctorDetail> => {
  const { data } = await apiClient.get<DoctorDetail>(`/api/doctors/${id}/`);
  return data;
};

// Засчитать просмотр анкеты врача. Страница врача отдаётся из ISR-кеша, и
// GET детальной до бэка почти не доходит — поэтому просмотр шлётся отдельно,
// из браузера посетителя (features/profile-view-tracker).
export const trackDoctorProfileView = async (
  id: number | string,
): Promise<void> => {
  await apiClient.post(`/api/doctors/${id}/view/`);
};

// excludeAppointmentId — при переносе: своя же запись не должна занимать
// время, на которое её двигают. Бэк учитывает его, только если спрашивает
// пациент или врач этой записи.
export const getDoctorAvailableSlots = async (
  id: number | string,
  date: string,
  service_id?: null | number | string,
  excludeAppointmentId?: null | number | string,
): Promise<AvailableSlotsResponse> => {
  const { data } = await apiClient.get<AvailableSlotsResponse>(
    `/api/doctors/${id}/available-slots/`,
    {
      params: {
        date,
        ...(service_id ? { service_id } : {}),
        ...(excludeAppointmentId
          ? { exclude_appointment_id: excludeAppointmentId }
          : {}),
      },
    },
  );
  return data;
};

// Даты периода [from, to] ("YYYY-MM-DD", не больше 62 дней), на которые есть
// хотя бы один свободный слот. Считается теми же правилами, что и слоты, —
// календарь красит зелёным именно эти дни. Параметры как у слотов.
export const getDoctorAvailableDates = async (
  id: number | string,
  from: string,
  to: string,
  service_id?: null | number | string,
  excludeAppointmentId?: null | number | string,
): Promise<AvailableDatesResponse> => {
  const { data } = await apiClient.get<AvailableDatesResponse>(
    `/api/doctors/${id}/available-dates/`,
    {
      params: {
        from,
        to,
        ...(service_id ? { service_id } : {}),
        ...(excludeAppointmentId
          ? { exclude_appointment_id: excludeAppointmentId }
          : {}),
      },
    },
  );
  return data;
};
