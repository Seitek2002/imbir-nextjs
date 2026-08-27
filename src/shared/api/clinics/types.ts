import { DaySchedule } from "../auth/types";
import type { SpecializationItem } from "../references/types";

export type ClinicSchedule = {
  [day: string]: Pick<DaySchedule, "enabled" | "from" | "to">;
};

export type ClinicBranch = {
  address: string;
  city?: string;
  coordinates?: { lat: number; lng: number };
  id: number | string;
  phone?: string;
  schedule?: ClinicSchedule | string;
};

// Врач в составе карточки клиники (GET /api/clinics/{id}/ → doctors[]).
export type ClinicDoctor = {
  experience_years: number;
  full_name: string;
  id: number;
  photo: null | string;
  // Строка, а не число: DecimalField в DRF сериализуется как "5.00" — проверено
  // живым запросом. Раньше здесь стоял number, и каждый потребитель узнавал об этом
  // сам и только в браузере.
  rating: string;
  specialty: string;
};

export type ClinicListItem = {
  address?: string;
  city: string;
  clinic_type?: string;
  doctors_count: number;
  experience_years?: number;
  id: number;
  logo: null | string;
  name: string;
  // Объекты {id, name, photo}, не строки — бэк вернул этот эндпоинт к
  // справочнику специализаций (проверено живым запросом).
  primary_specializations?: SpecializationItem[];
  // Строка, а не число: DecimalField в DRF сериализуется как "5.00" — проверено
  // живым запросом. Раньше здесь стоял number, и каждый потребитель узнавал об этом
  // сам и только в браузере.
  rating: string;
  reviews_count: number;
};

export type ClinicDetail = ClinicListItem & {
  branches: ClinicBranch[];
  description: null | string;
  // Врачи именно этой клиники — источник списка «Выберите специалиста».
  doctors: ClinicDoctor[];
  email: null | string;
  equipment: string[];
  location: { lat: number; lng: number } | null;
  patient_conditions: string[];
  payment_methods: string[];
  phone: null | string;
  photos: string[];
  schedule: ClinicSchedule;
  website: null | string;
};

export type ClinicFilters = {
  city?: string;
  max_experience?: number;
  max_price?: number;
  // Стаж клиники (лет с момента основания).
  min_experience?: number;
  // Фильтр по стоимости услуг: клиника попадает в выдачу, если предлагает
  // хотя бы одну услугу в указанном диапазоне цен.
  min_price?: number;
  min_rating?: number;
  page?: number;
  page_size?: number;
  payment_method?: string;
  search?: string;
  specialization?: string;
};
