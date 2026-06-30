import { AuthUser } from "@/shared/store/authStore";

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

export type RegisterClientRequest = {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone: string;
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

// Поля шагов (кроме step1.email/full_name и согласий в step7) на бэке
// необязательны — отдаём то, что собирает форма, остальное опускаем.
export type RegisterDoctorRequest = {
  password: string;
  step1: {
    full_name: string;
    email: string;
    phone?: string;
    gender?: string;
    birth_date?: string | null;
    city?: string;
    languages?: string[];
  };
  step2: {
    country?: string;
    city?: string;
    address?: string;
    phone?: string;
    website?: string;
    location?: { lat: number; lng: number };
  };
  step3: {
    schedule?: Record<string, unknown>;
    lunch_break?: Record<string, unknown>;
    emergency_24_7?: boolean;
  };
  step4: {
    legal_name?: string;
    reg_number?: string;
    license_number?: string;
    license_date?: string | null;
    license_authority?: string;
  };
  step5: {
    primary_specializations?: string[];
    narrow_specializations?: string[];
    additional_services?: string;
  };
  step6: {
    equipment?: string[];
    patient_conditions?: string[];
    payment_methods?: string[];
  };
  step7: {
    agree_terms: boolean;
    agree_privacy: boolean;
    agree_data_processing: boolean;
    agree_publishing: boolean;
  };
  photo?: File;
  invite_clinic_id?: number;
  invite_branch_id?: number;
};

// Бэк принимает step1..step7 как JSON-строки (multipart), logo — бинарно
// на верхнем уровне. Файлы внутри шагов не сериализуются, поэтому фото/
// документы при регистрации не отправляются (грузятся позже, в кабинете).
export type RegisterClinicRequest = {
  password: string;
  step1: {
    name: string;
    type: string;
    description: string;
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
    schedule: Record<string, unknown>;
    lunch_break: Record<string, unknown>;
    emergency_24_7: boolean;
  };
  step4: {
    legal_name: string;
    reg_number: string;
    license_number: string;
    license_date: string | null;
    license_authority: string;
  };
  step5: {
    primary_specializations: string[];
    narrow_specializations: string[];
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
  logo?: File;
};
