import { apiClient } from "../client";
import {
  AppointmentResponse,
  CancelAppointmentRequest,
  CreateAppointmentRequest,
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

export const cancelAppointment = async (
  id: number,
  body: CancelAppointmentRequest = { status: "cancelled" },
): Promise<void> => {
  await apiClient.patch(`/api/appointments/${id}/`, body);
};
