import { apiClient } from "../client";
import { PaginatedResponse } from "../types";
import {
  ClientProfile,
  FavoriteTargetRequest,
  FavoritesList,
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

  // A new avatar must go as multipart/form-data (binary `avatar_upload`);
  // plain JSON is enough when only text fields change.
  if (avatar_upload) {
    const form = new FormData();
    Object.entries(rest).forEach(([key, value]) => {
      if (value !== undefined && value !== null)
        form.append(key, String(value));
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

export const EMPTY_FAVORITES: FavoritesList = {
  doctors: [],
  clinics: [],
  services: [],
};

// GET заворачивает ответ в { data: {...} }, а POST отдаёт тот же объект без
// обёртки — принимаем оба варианта.
const toFavoritesList = (payload: unknown): FavoritesList => {
  const raw = payload as
    | ({ data?: Partial<FavoritesList> } & Partial<FavoritesList>)
    | undefined;
  const list = raw?.data ?? raw;

  return {
    doctors: list?.doctors ?? [],
    clinics: list?.clinics ?? [],
    services: list?.services ?? [],
  };
};

export const getFavorites = async (): Promise<FavoritesList> => {
  const { data } = await apiClient.get("/api/profile/favorites/");
  return toFavoritesList(data);
};

export const addFavorite = async (
  body: FavoriteTargetRequest,
): Promise<FavoritesList> => {
  const { data } = await apiClient.post("/api/profile/favorites/", body);
  return toFavoritesList(data);
};

// Отдельного /favorites/{id}/ у бэка нет (404) — удаление идёт по цели, тем же
// телом, что и добавление.
export const removeFavorite = async (
  body: FavoriteTargetRequest,
): Promise<void> => {
  await apiClient.delete("/api/profile/favorites/", { data: body });
};

export const getProfileReviews = async (): Promise<
  PaginatedResponse<PatientReview>
> => {
  const { data } = await apiClient.get<PaginatedResponse<PatientReview>>(
    "/api/profile/reviews/",
  );
  return data;
};
