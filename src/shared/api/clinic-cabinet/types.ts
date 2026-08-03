import type { SpecializationItem } from "../references/types";
import type { ServiceListItem } from "../services/types";

export type ClinicProfileBranch = {
  id: number;
  address: string;
};

export type ClinicDocument = {
  id: number;
  url: string;
  uploaded_at: string;
};

export type ClinicPhoto = {
  id: number;
  url: string;
  uploaded_at: string;
};

// Соответствует реальному ответу GET/PUT /api/clinic/profile/ — плоский
// объект, ОТЛИЧАЕТСЯ от публичной карточки клиники (ClinicDetail), у которой
// другие имена полей (about вместо description, нет id и т.д.). Не путать!
export type ClinicPrivateProfile = {
  id?: number;
  name: string;
  clinic_type: string;
  description: string;
  logo: string | null;
  email: string;
  phone: string;
  website: string;
  country: string;
  city: string;
  address: string;
  latitude: string | null;
  longitude: string | null;
  schedule: Record<string, { from: string; to: string; enabled: boolean }>;
  lunch_break: { from: string; to: string } | null;
  emergency_24_7: boolean;
  legal_name: string;
  reg_number: string;
  license_number: string;
  license_date: string | null;
  license_authority: string;
  // Объекты {id, name, photo} на чтение; на запись PUT принимает отдельные
  // поля primary_specialization_ids/narrow_specialization_ids (числа) — см.
  // UpdateClinicProfileBody.
  primary_specializations: SpecializationItem[];
  narrow_specializations: SpecializationItem[];
  additional_services: string;
  equipment: string[];
  patient_conditions: string[];
  payment_methods: string[];
  experience_years: number;
  rating: string;
  reviews_count: number;
  doctors_count: number;
  is_published: boolean;
  profile_views: number;
  branches: ClinicProfileBranch[];
};

export type ClinicDoctorItem = {
  id: number;
  full_name: string;
  specialty: string;
  photo: string | null;
  rating: number;
  appointments_total: number;
  is_active: boolean;
};

// POST/PUT /api/clinic/services/. doctor_ids — список User ID врачей ЭТОЙ
// клиники, которым назначается услуга (при PUT старые связи заменяются на
// новые). Допускаются только врачи, привязанные к клинике через
// DoctorClinicLink — иначе бэк вернёт 400.
export type ClinicServiceBody = {
  name: string;
  category: string;
  description?: string;
  price?: string | null;
  duration?: number | null;
  is_active?: boolean;
  doctor_ids?: number[];
};

// Врач в ответе услуги (POST/PUT/GET возвращают услугу с doctors[]).
export type ClinicServiceDoctor = {
  id: number;
  full_name: string;
};

// Услуга в кабинете клиники = публичная услуга + назначенные врачи.
// doctors приходит и в списке, и в ответе создания/обновления.
export type ClinicServiceListItem = ServiceListItem & {
  doctors?: ClinicServiceDoctor[];
  description?: string;
  is_active?: boolean;
};

// Ответ создания/обновления услуги клиники (с назначенными врачами).
export type ClinicServiceResponse = {
  id: number;
  name: string;
  category: string;
  price: string | null;
  doctors: ClinicServiceDoctor[];
  created_at: string;
};

// POST /api/clinic/doctors/ — регистрация врача клиникой из кабинета.
// password необязателен (по умолчанию бэк ставит "Doctor123!"). Почта и
// телефон должны быть уникальны — иначе 400.
export type CreateClinicDoctorRequest = {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  password?: string;
};

export type ClinicAppointmentFilters = {
  status?: string;
  doctor_id?: number;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
};

export type ClinicStats = {
  profile_views: number;
  profile_views_this_month: number;
  appointments_total: number;
  appointments_this_month: number;
  average_rating: number;
  reviews_count: number;
  doctors_count: number;
  patients_total: number;
  revenue_this_month: number;
};

// Real API: branch is integer, has is_valid field
export type InviteLink = {
  id: string;
  branch: number | null;
  expires_at: string | null;
  is_active: boolean;
  is_valid: boolean;
  created_at: string;
};

export type CreateInviteRequest = {
  branch?: number;
};

export type UpdateBranchRequest = {
  address?: string;
  phone?: string;
  schedule?: string;
};
