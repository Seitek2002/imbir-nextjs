import type { AuthUser } from "@/shared/store/authStore";

import { apiClient } from "../client";
import {
  AuthResponse,
  LoginRequest,
  PasswordResetConfirmRequest,
  PasswordResetRequest,
  PasswordResetVerifyRequest,
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
  // Бэк ждёт вложенные step-объекты в JSON; multipart со stringified-шагами
  // он отклоняет ("stepN: Обязательное поле"). Файлы (фото, документы) в JSON
  // не уходят — грузятся отдельно в кабинете после регистрации.
  const payload = {
    ...body,
    step1: { ...body.step1, photo: undefined },
    step4: { ...body.step4, documents: undefined },
  };
  const { data } = await apiClient.post<AuthResponse>(
    "/api/auth/register/doctor/",
    payload,
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

// Бэк отвечает одинаковым detail независимо от того, существует email —
// это ожидаемо (защита от перебора почт), не ошибка.
export const requestPasswordResetFn = async (
  body: PasswordResetRequest,
): Promise<{ detail: string }> => {
  const { data } = await apiClient.post<{ detail: string }>(
    "/api/auth/password-reset/",
    body,
  );
  return data;
};

// Проверка кода из письма. 400 — неверный/истёкший код.
export const verifyPasswordResetFn = async (
  body: PasswordResetVerifyRequest,
): Promise<{ detail: string }> => {
  const { data } = await apiClient.post<{ detail: string }>(
    "/api/auth/password-reset/verify/",
    body,
  );
  return data;
};

// Финальный шаг: установка нового пароля по email+коду.
export const confirmPasswordResetFn = async (
  body: PasswordResetConfirmRequest,
): Promise<{ detail: string }> => {
  const { data } = await apiClient.post<{ detail: string }>(
    "/api/auth/password-reset/confirm/",
    body,
  );
  return data;
};
