import type { AuthUser } from "@/shared/store/authStore";

import { apiClient } from "../client";
import {
  AuthResponse,
  LoginRequest,
  RefreshResponse,
  RegisterClientRequest,
  RegisterClinicRequest,
  RegisterDoctorRequest,
} from "./types";

// Helper: flatten a multipart registration object into FormData
const toFormData = (data: Record<string, unknown>): FormData => {
  const form = new FormData();
  const stringify = (val: unknown): string =>
    typeof val === "object" ? JSON.stringify(val) : String(val);

  Object.entries(data).forEach(([key, value]) => {
    if (value instanceof File) {
      form.append(key, value);
    } else if (Array.isArray(value)) {
      value.forEach((item) =>
        item instanceof File
          ? form.append(key, item)
          : form.append(key, stringify(item)),
      );
    } else if (value !== undefined && value !== null) {
      form.append(key, stringify(value));
    }
  });
  return form;
};

export const loginFn = async (body: LoginRequest): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>("/api/auth/login/", body);
  return data;
};

export const registerClientFn = async (
  body: RegisterClientRequest,
): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>(
    "/api/auth/register/client/",
    body,
  );
  return data;
};

export const registerDoctorFn = async (
  body: RegisterDoctorRequest,
): Promise<AuthResponse> => {
  // Бэк ждёт вложенные step-объекты — отправляем JSON (multipart со
  // step-полями он не принимает). Фото грузится отдельно, в кабинете.
  const { data } = await apiClient.post<AuthResponse>(
    "/api/auth/register/doctor/",
    body,
  );
  return data;
};

export const registerClinicFn = async (
  body: RegisterClinicRequest,
): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>(
    "/api/auth/register/clinic/",
    toFormData(body as unknown as Record<string, unknown>),
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
};

// refresh field name matches real API: { refresh: "..." }
export const refreshTokenFn = async (
  refreshToken: string,
): Promise<RefreshResponse> => {
  const { data } = await apiClient.post<RefreshResponse>("/api/auth/refresh/", {
    refresh: refreshToken,
  });
  return data;
};

export const logoutFn = async (refreshToken: string): Promise<void> => {
  await apiClient.post("/api/auth/logout/", { refresh: refreshToken });
};

export const getMeFn = async (): Promise<AuthUser> => {
  const { data } = await apiClient.get<AuthUser>("/api/auth/me/");
  return data;
};
