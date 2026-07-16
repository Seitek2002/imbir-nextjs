import { DaySchedule } from "../auth/types";

export type ClinicSchedule = {
  [day: string]: Pick<DaySchedule, "from" | "to" | "enabled">;
};

export type ClinicBranch = {
  id: number | string;
  address: string;
  phone?: string;
  schedule?: ClinicSchedule | string;
  city?: string;
  coordinates?: { lat: number; lng: number };
};

// Врач в составе карточки клиники (GET /api/clinics/{id}/ → doctors[]).
export type ClinicDoctor = {
  id: number;
  full_name: string;
  photo: string | null;
  specialty: string;
  rating: number;
  experience_years: number;
};

export type ClinicListItem = {
  id: number;
  name: string;
  logo: string | null;
  city: string;
  clinic_type?: string;
  rating: number;
  reviews_count: number;
  doctors_count: number;
  experience_years?: number;
  address?: string;
  primary_specializations?: string[];
};

export type ClinicDetail = ClinicListItem & {
  photos: string[];
  phone: string | null;
  email: string | null;
  website: string | null;
  description: string | null;
  schedule: ClinicSchedule;
  equipment: string[];
  patient_conditions: string[];
  payment_methods: string[];
  location: { lat: number; lng: number } | null;
  branches: ClinicBranch[];
  // Врачи именно этой клиники — источник списка «Выберите специалиста».
  doctors: ClinicDoctor[];
};

export type ClinicFilters = {
  search?: string;
  city?: string;
  specialization?: string;
  min_rating?: number;
  // Стаж клиники (лет с момента основания).
  min_experience?: number;
  max_experience?: number;
  // Фильтр по стоимости услуг: клиника попадает в выдачу, если предлагает
  // хотя бы одну услугу в указанном диапазоне цен.
  min_price?: number;
  max_price?: number;
  payment_method?: string;
  page?: number;
  page_size?: number;
};
