import { AuthUser } from "@/shared/store/authStore";

// Вход по почте ИЛИ по номеру телефона. Бэк принимает и то, и другое, но
// identifier ВСЕГДА идёт в поле `email` (проверено: отдельного поля `phone`
// нет — запрос без `email` возвращает "email: Обязательное поле", а телефон в
// формате E.164, напр. +996700000000, в поле `email` бэк принимает).
export type LoginRequest = {
  email: string;
  password: string;
};

export type AuthResponse = {
  access: string;
  refresh: string;
  user: AuthUser;
};

export type RefreshResponse = {
  access: string;
  refresh: string;
};

export type PasswordResetRequest = {
  email: string;
};

export type PasswordResetVerifyRequest = {
  code: string;
  email: string;
};

export type PasswordResetConfirmRequest = {
  code: string;
  email: string;
  password: string;
};

// POST /api/auth/email/check/ — чистая проверка занятости, без побочных
// эффектов (кода не отправляет, аккаунт не создаёт). Некорректный формат
// email — обычная 400-ошибка валидации, а не { available: false }.
export type EmailCheckRequest = {
  email: string;
};

export type EmailCheckResponse = {
  data: {
    available: boolean;
    email: string;
  };
};

export type RegisterClientRequest = {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  phone: string;
};

export type PhoneRegisterRequestRequest = {
  phone: string;
};

// Общий ответ всех «запросить код» и «подтвердить контакт» — только detail.
export type OtpDetailResponse = {
  detail: string;
};

// Историческое имя, оставлено ради вызовов, написанных до появления остальных
// OTP-эндпоинтов.
export type PhoneRegisterRequestSuccess = OtpDetailResponse;

export type PhoneRegisterConfirmRequest = {
  code: string;
  first_name: string;
  last_name: string;
  // Обязателен: схема PhoneRegisterConfirmRequest требует пароль наравне с
  // именем и фамилией (раньше поле было опциональным).
  password: string;
  phone: string;
};

// ── Регистрация пациента по email через код ──────────────────────────────────
// Два запроса: request отправляет код, confirm проверяет его И СРАЗУ создаёт
// аккаунт, возвращая токены (в отличие от verify/* ниже).

export type EmailRegisterRequestRequest = {
  email: string;
};

export type EmailRegisterConfirmRequest = {
  code: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
};

// ── Подтверждение контакта для врача/клиники ─────────────────────────────────
// Аккаунт НЕ создаётся: подтверждение только снимает гейт с
// /register/doctor/ и /register/clinic/ и действует 24 часа. Нужно подтвердить
// ОДИН канал — email ИЛИ телефон, тот, что указан в анкете.

export type VerifyEmailConfirmRequest = {
  code: string;
  email: string;
};

export type VerifyPhoneConfirmRequest = {
  code: string;
  phone: string;
};

// ── Вход по коду, без пароля ─────────────────────────────────────────────────
// Работает для любой существующей роли. Канал один: email ЛИБО phone.

export type LoginOtpRequestRequest = {
  email?: string;
  phone?: string;
};

export type LoginOtpVerifyRequest = {
  code: string;
  email?: string;
  phone?: string;
};

export type DaySchedule = {
  enabled: boolean;
  from: null | string;
  to: null | string;
};

export type WeekSchedule = {
  friday: DaySchedule;
  monday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
  thursday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
};

export type LunchBreak = {
  from: string;
  to: string;
};

// Фото сюда не входит: бэк принимает его отдельным top-level multipart-полем
// запроса /register/doctor/, а не внутри JSON-строки шага — File внутри
// JSON.stringify всё равно превращается в "{}" (та же история, что с
// logo/photos/documents у RegisterClinicRequest). Реальная загрузка идёт
// отдельным updateDoctorProfile({photo}) сразу после регистрации.
export type RegisterDoctorRequest = {
  invite_branch_id?: number;
  invite_clinic_id?: number;
  password: string;
  step1: {
    birth_date: string;
    city: string;
    email: string;
    full_name: string;
    gender: "female" | "male";
    languages: string[];
    phone: string;
  };
  step2: {
    address: string;
    city: string;
    country: string;
    email: string;
    location?: { lat: number; lng: number };
    phone: string;
    website?: string;
  };
  step3: {
    emergency_24_7: boolean;
    lunch_break: LunchBreak;
    schedule: WeekSchedule;
  };
  step4: {
    documents?: File[];
    legal_name: string;
    license_authority: string;
    license_date?: string;
    license_number: string;
    reg_number: string;
  };
  step5: {
    additional_services?: string;
    narrow_specialization_ids: number[];
    primary_specialization_ids: number[];
  };
  step6: {
    equipment: string[];
    patient_conditions: string[];
    payment_methods: string[];
  };
  step7: {
    agree_data_processing: boolean;
    agree_privacy: boolean;
    agree_publishing: boolean;
    agree_terms: boolean;
  };
};

export type DoctorInviteValidationClinic = {
  city: string;
  doctors_count: number;
  id: number;
  logo: null | string;
  name: string;
  rating: number | string;
  reviews_count: number;
};

export type DoctorInviteValidationBranch = {
  address: string;
  id: number;
  name: string;
};

export type DoctorInviteValidationResponse = {
  data: {
    branch: DoctorInviteValidationBranch | null;
    clinic: DoctorInviteValidationClinic | null;
    valid: boolean;
  };
};

// Файлы (logo/photos/documents) сюда не входят: бэк принимает их как
// отдельные top-level multipart-поля запроса /register/clinic/, а не внутри
// JSON-строки какого-либо шага — File внутри JSON.stringify всё равно
// превращается в "{}". См. CLINIC_REGISTRATION.md (от бэкенд-разработчика) и
// pages/register/ui.tsx: handleSubmitClinic грузит их отдельными вызовами
// (updateClinicProfile/uploadClinicPhoto/uploadClinicDocument) сразу после
// успешной регистрации.
export type RegisterClinicRequest = {
  password: string;
  step1: {
    description: string;
    name: string;
    type: string;
  };
  step2: {
    address: string;
    city: string;
    country: string;
    email: string;
    location?: { lat: number; lng: number };
    phone: string;
    website?: string;
  };
  step3: {
    emergency_24_7: boolean;
    lunch_break: LunchBreak;
    schedule: WeekSchedule;
  };
  step4: {
    legal_name: string;
    license_authority: string;
    license_date: string;
    license_number: string;
    reg_number: string;
  };
  // Ключи без суффикса _ids — так задокументировал бэкенд-разработчик
  // (CLINIC_REGISTRATION.md). Это ДРУГАЯ форма, чем у UpdateClinicProfileBody
  // (там primary_specialization_ids/narrow_specialization_ids) — не путать.
  step5: {
    additional_services?: string;
    narrow_specializations: number[];
    primary_specializations: number[];
  };
  step6: {
    equipment: string[];
    patient_conditions: string[];
    payment_methods: string[];
  };
  step7: {
    agree_data_processing: boolean;
    agree_privacy: boolean;
    agree_publishing: boolean;
    agree_terms: boolean;
  };
};
