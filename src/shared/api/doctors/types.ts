import { DaySchedule, LunchBreak } from "../auth/types";

export type DoctorWorkplaceSchedule = {
  [day: string]: Pick<DaySchedule, "from" | "to" | "enabled">;
};

export type DoctorWorkplace = {
  id?: number;
  name?: string;
  clinic_id?: number;
  clinic_name?: string;
  clinic_address?: string;
  price?: number;
  schedule: DoctorWorkplaceSchedule | string;
  lunch_break?: LunchBreak;
};

export type DoctorListItem = {
  id: number;
  full_name: string;
  specialty: string;
  photo: string | null;
  rating: number;
  reviews_count: number;
  experience_years: number;
  is_online_available: boolean;
  city: string;
  workplaces: DoctorWorkplace[];
};

export type EducationItem = {
  institution: string;
  degree: string;
  year: number;
};

// Свободный JSON на бэке (в схеме API — nullable без типа) — разные записи
// могут прислать разный набор полей. Диапазон лет (from/to) и квалификация
// без дат (qualification/scientific_degree) — оба реально встречаются,
// не одновременно.
export type WorkExperienceItem = {
  clinic: string;
  position: string;
  from?: number;
  to?: number | null;
  qualification?: string;
  scientific_degree?: string;
};

export type DoctorDetail = DoctorListItem & {
  languages: string[];
  about: string;
  education: EducationItem[];
  work_experience: WorkExperienceItem[];
  skills: string[];
  equipment: string[];
  patient_conditions: string[];
  payment_methods: string[];
  phone: string | null;
  email: string | null;
  location: { lat: number; lng: number } | null;
};

export type DoctorFilters = {
  search?: string;
  city?: string;
  specialization?: string;
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  is_online?: boolean;
  payment_method?: string;
  min_experience?: number;
  max_experience?: number;
  page?: number;
  page_size?: number;
};

export type AvailableSlot = {
  time: string; // "HH:mm"
  available: boolean;
};

export type AvailableSlotsResponse = {
  date: string;
  slots: AvailableSlot[];
};
