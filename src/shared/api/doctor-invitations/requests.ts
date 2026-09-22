import { apiClient } from "../client";
import type { PaginatedResponse } from "../types";
import type {
  ClinicDoctorInvitation,
  CreateDoctorInvitationBody,
  DoctorInvitation,
  DoctorInvitationStatus,
} from "./types";

export const getClinicDoctorInvitations = async (
  status: "" | DoctorInvitationStatus = "pending",
  page = 1,
): Promise<PaginatedResponse<ClinicDoctorInvitation>> => {
  const { data } = await apiClient.get("/api/clinic/doctor-invitations/", {
    params: { ...(status ? { status } : {}), page },
  });
  return data;
};

export const createDoctorInvitation = async (
  body: CreateDoctorInvitationBody,
): Promise<ClinicDoctorInvitation> => {
  const { data } = await apiClient.post(
    "/api/clinic/doctor-invitations/",
    body,
  );
  return data;
};

export const cancelDoctorInvitation = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/clinic/doctor-invitations/${id}/`);
};

export const getDoctorInvitations = async (
  status: "" | DoctorInvitationStatus = "pending",
  page = 1,
): Promise<PaginatedResponse<DoctorInvitation>> => {
  const { data } = await apiClient.get("/api/doctor/invitations/", {
    params: { ...(status ? { status } : {}), page },
  });
  return data;
};

export const acceptDoctorInvitation = async (
  id: number,
): Promise<DoctorInvitation> => {
  const { data } = await apiClient.post(
    `/api/doctor/invitations/${id}/accept/`,
  );
  return data;
};

export const declineDoctorInvitation = async (
  id: number,
): Promise<DoctorInvitation> => {
  const { data } = await apiClient.post(
    `/api/doctor/invitations/${id}/decline/`,
  );
  return data;
};
