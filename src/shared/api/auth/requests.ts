import type { AuthUser } from "@/shared/store/authStore";

import { apiClient } from "../client";
import {
  AuthResponse,
  LoginRequest,
  PasswordResetConfirmRequest,
  PasswordResetRequest,
  PasswordResetVerifyRequest,
  PhoneRegisterConfirmRequest,
  PhoneRegisterRequestRequest,
  PhoneRegisterRequestSuccess,
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

export const registerPhoneRequestFn = async (
  body: PhoneRegisterRequestRequest,
): Promise<PhoneRegisterRequestSuccess> => {
  const { data } = await apiClient.post<PhoneRegisterRequestSuccess>(
    "/api/auth/register/phone/request/",
    body,
  );
  return data;
};

export const registerPhoneConfirmFn = async (
  body: PhoneRegisterConfirmRequest,
): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>(
    "/api/auth/register/phone/confirm/",
    body,
  );
  return data;
};

export const registerDoctorFn = async (
  body: RegisterDoctorRequest,
): Promise<AuthResponse> => {
  // API объявляет шаги строковыми полями: каждый объект шага нужно передавать
  // как JSON-строку. Файлы в этот endpoint не входят и загружаются из кабинета
  // после регистрации.
  const payload = {
    ...body,
    step1: JSON.stringify({ ...body.step1, photo: undefined }),
    step2: JSON.stringify(body.step2),
    step3: JSON.stringify(body.step3),
    step4: JSON.stringify({ ...body.step4, documents: undefined }),
    step5: JSON.stringify(body.step5),
    step6: JSON.stringify(body.step6),
    step7: JSON.stringify(body.step7),
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
