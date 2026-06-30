import { apiClient } from "../client";
import { PaginatedResponse } from "../types";
import {
  AddFavoriteRequest,
  ClientProfile,
  FavoriteItem,
  PatientReview,
  ProfileAppointment,
  UpdateProfileRequest,
} from "./types";

export const getProfile = async (): Promise<ClientProfile> => {
  const { data } = await apiClient.get<ClientProfile>("/api/profile/");
  return data;
};

export const updateProfile = async (
  body: UpdateProfileRequest,
): Promise<ClientProfile> => {
  const { avatar_upload, ...rest } = body;

  if (avatar_upload) {
    const form = new FormData();
    Object.entries(rest).forEach(([k, v]) => {
      if (v !== undefined && v !== null) form.append(k, String(v));
    });
    form.append("avatar_upload", avatar_upload);
    const { data } = await apiClient.put<ClientProfile>("/api/profile/", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  }

  const { data } = await apiClient.put<ClientProfile>("/api/profile/", rest);
  return data;
};

export const getProfileAppointments = async (
  status?: "upcoming" | "completed" | "cancelled",
  page = 1,
  page_size = 20,
): Promise<PaginatedResponse<ProfileAppointment>> => {
  const { data } = await apiClient.get<PaginatedResponse<ProfileAppointment>>(
    "/api/profile/appointments/",
    { params: { status, page, page_size } },
  );
  return data;
};

export const getFavorites = async (): Promise<FavoriteItem[]> => {
  const { data } = await apiClient.get<PaginatedResponse<FavoriteItem>>(
    "/api/profile/favorites/",
  );
  return data.data;
};

export const addFavorite = async (
  body: AddFavoriteRequest,
): Promise<FavoriteItem> => {
  const { data } = await apiClient.post<FavoriteItem>(
    "/api/profile/favorites/",
    body,
  );
  return data;
};

export const removeFavorite = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/profile/favorites/${id}/`);
};

export const getProfileReviews = async (): Promise<
  PaginatedResponse<PatientReview>
> => {
  const { data } = await apiClient.get<PaginatedResponse<PatientReview>>(
    "/api/profile/reviews/",
  );
  return data;
};
