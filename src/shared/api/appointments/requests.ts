import { apiClient } from "../client";
import {
  AppointmentResponse,
  CancelAppointmentRequest,
  CreateAppointmentRequest,
  RescheduleAppointmentRequest,
} from "./types";

export const createAppointment = async (
  body: CreateAppointmentRequest,
): Promise<AppointmentResponse> => {
  const { data } = await apiClient.post<AppointmentResponse>(
    "/api/appointments/",
    body,
  );
  return data;
};

// Одна запись — для проверки статуса/ссылки Meet после оформления.
export const getAppointmentById = async (
  id: number,
): Promise<AppointmentResponse> => {
  const { data } = await apiClient.get<AppointmentResponse>(
    `/api/appointments/${id}/`,
  );
  return data;
};

export const cancelAppointment = async (
  id: number,
  body: CancelAppointmentRequest = { status: "cancelled" },
): Promise<void> => {
  await apiClient.patch(`/api/appointments/${id}/`, body);
};

// Перенос записи. Возвращает обновлённую запись (в т.ч. новый google_meet_link
// для онлайн-консультаций; LiveKit-комната остаётся привязана к id записи).
export const rescheduleAppointment = async (
  id: number,
  body: RescheduleAppointmentRequest,
): Promise<AppointmentResponse> => {
  const { data } = await apiClient.post<AppointmentResponse>(
    `/api/appointments/${id}/reschedule/`,
    body,
  );
  return data;
};
