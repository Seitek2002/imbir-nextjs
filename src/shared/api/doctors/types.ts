import { DaySchedule, LunchBreak } from "../auth/types";

export type DoctorWorkplaceSchedule = {
  [day: string]: Pick<DaySchedule, "enabled" | "from" | "to">;
};

export type DoctorWorkplace = {
  clinic_address?: string;
  clinic_id?: number;
  clinic_name?: string;
  id?: number;
  lunch_break?: LunchBreak;
  name?: string;
  price?: number;
  schedule: DoctorWorkplaceSchedule | string;
};

export type DoctorListItem = {
  city: string;
  // Цена приёма ("1500.00" или null). Старый бэк поля не отдаёт — отсюда
  // optional; по ней же работает фильтр min_price/max_price.
  consultation_price?: null | string;
  experience_years: number;
  full_name: string;
  id: number;
  is_online_available: boolean;
  photo: null | string;
  // Строка, а не число: DecimalField в DRF сериализуется как "5.00" — проверено
  // живым запросом. Раньше здесь стоял number, и каждый потребитель узнавал об этом
  // сам и только в браузере.
  rating: string;
  reviews_count: number;
  specialty: string;
  workplaces: DoctorWorkplace[];
};

export type EducationItem = {
  degree: string;
  institution: string;
  year: number;
};

// Свободный JSON на бэке (в схеме API — nullable без типа) — разные записи
// могут прислать разный набор полей. Диапазон лет (from/to) и квалификация
// без дат (qualification/scientific_degree) — оба реально встречаются,
// не одновременно.
export type WorkExperienceItem = {
  clinic: string;
  from?: number;
  position: string;
  qualification?: string;
  scientific_degree?: string;
  to?: null | number;
};

// Недельный график врача: monday…sunday. enabled: false — в этот день слотов
// не будет (выходной, нет графика или время не разобрать).
export type DoctorWeekSchedule = Record<string, DaySchedule>;

export type DoctorDetail = DoctorListItem & {
  about: string;
  education: EducationItem[];
  email: null | string;
  equipment: string[];
  languages: string[];
  location: { lat: number; lng: number } | null;
  // Старый бэк этих полей не отдаёт — тогда календарь гасит только прошлое
  // и даты дальше горизонта записи.
  lunch_break?: LunchBreak | null;
  patient_conditions: string[];
  payment_methods: string[];
  phone: null | string;
  schedule?: DoctorWeekSchedule | null;
  skills: string[];
  work_experience: WorkExperienceItem[];
};

export type DoctorFilters = {
  city?: string;
  is_online?: boolean;
  max_experience?: number;
  max_price?: number;
  min_experience?: number;
  min_price?: number;
  min_rating?: number;
  page?: number;
  page_size?: number;
  payment_method?: string;
  search?: string;
  specialization?: string;
};

export type AvailableSlot = {
  available: boolean;
  time: string; // "HH:mm"
};

export type AvailableSlotsResponse = {
  date: string;
  slots: AvailableSlot[];
};
