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
  email: string;
  code: string;
};

export type PasswordResetConfirmRequest = {
  email: string;
  code: string;
  password: string;
};

export type RegisterClientRequest = {
  first_name: string;
  last_name: string;
  email: string;
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
  phone: string;
  code: string;
  // Обязателен: схема PhoneRegisterConfirmRequest требует пароль наравне с
  // именем и фамилией (раньше поле было опциональным).
  password: string;
  first_name: string;
  last_name: string;
};

// ── Регистрация пациента по email через код ──────────────────────────────────
// Два запроса: request отправляет код, confirm проверяет его И СРАЗУ создаёт
// аккаунт, возвращая токены (в отличие от verify/* ниже).

export type EmailRegisterRequestRequest = {
  email: string;
};

export type EmailRegisterConfirmRequest = {
  email: string;
  code: string;
  password: string;
  first_name: string;
  last_name: string;
};

// ── Подтверждение контакта для врача/клиники ─────────────────────────────────
// Аккаунт НЕ создаётся: подтверждение только снимает гейт с
// /register/doctor/ и /register/clinic/ и действует 24 часа. Нужно подтвердить
// ОДИН канал — email ИЛИ телефон, тот, что указан в анкете.

export type VerifyEmailConfirmRequest = {
  email: string;
  code: string;
};

export type VerifyPhoneConfirmRequest = {
  phone: string;
  code: string;
};

// ── Вход по коду, без пароля ─────────────────────────────────────────────────
// Работает для любой существующей роли. Канал один: email ЛИБО phone.

export type LoginOtpRequestRequest = {
  email?: string;
  phone?: string;
};

export type LoginOtpVerifyRequest = {
  email?: string;
  phone?: string;
  code: string;
};

export type DaySchedule = {
  from: string | null;
  to: string | null;
  enabled: boolean;
};

export type WeekSchedule = {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
};

export type LunchBreak = {
  from: string;
  to: string;
};

export type RegisterDoctorRequest = {
  invite_clinic_id?: string;
  invite_branch_id?: string;
  password: string;
  step1: {
    full_name: string;
    gender: "male" | "female";
    birth_date: string;
    city: string;
    languages: string[];
    phone: string;
    email: string;
    photo?: File;
  };
  step2: {
    country: string;
    city: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
    location?: { lat: number; lng: number };
  };
  step3: {
    schedule: WeekSchedule;
    lunch_break: LunchBreak;
    emergency_24_7: boolean;
  };
  step4: {
    legal_name: string;
    reg_number: string;
    license_number: string;
    license_date?: string;
    license_authority: string;
    documents?: File[];
  };
  step5: {
    primary_specialization_ids: number[];
    narrow_specialization_ids: number[];
    additional_services?: string;
  };
  step6: {
    equipment: string[];
    patient_conditions: string[];
    payment_methods: string[];
  };
  step7: {
    agree_terms: boolean;
    agree_privacy: boolean;
    agree_data_processing: boolean;
    agree_publishing: boolean;
  };
};

export type RegisterClinicRequest = {
  password: string;
  step1: {
    name: string;
    logo?: File;
    type: string;
    description: string;
    photos?: File[];
  };
  step2: {
    country: string;
    city: string;
    address: string;
    phone: string;
    email: string;
    website?: string;
    location?: { lat: number; lng: number };
  };
  step3: {
    schedule: WeekSchedule;
    lunch_break: LunchBreak;
    emergency_24_7: boolean;
  };
  step4: {
    legal_name: string;
    reg_number: string;
    license_number: string;
    license_date: string;
    license_authority: string;
    documents?: File[];
  };
  step5: {
    primary_specialization_ids: number[];
    narrow_specialization_ids: number[];
    additional_services?: string;
  };
  step6: {
    equipment: string[];
    patient_conditions: string[];
    payment_methods: string[];
  };
  step7: {
    agree_terms: boolean;
    agree_privacy: boolean;
    agree_data_processing: boolean;
    agree_publishing: boolean;
  };
};
