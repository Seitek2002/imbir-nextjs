import { LunchBreak, WeekSchedule } from "../auth/types";
import { EducationItem, WorkExperienceItem } from "../doctors/types";

// Соответствует схеме DoctorOwnProfile (GET/PUT /api/doctor/profile/) —
// плоский объект, поля отличаются от публичной карточки врача.
export type DoctorPrivateProfile = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  gender: string;
  birth_date: string | null;
  city: string;
  languages: string[];
  photo: string | null;
  country: string;
  address: string;
  website: string;
  latitude: string | null;
  longitude: string | null;
  schedule: Record<string, unknown>;
  lunch_break: Record<string, unknown> | null;
  emergency_24_7: boolean;
  legal_name: string;
  reg_number: string;
  license_number: string;
  license_date: string | null;
  license_authority: string;
  primary_specializations: string[];
  narrow_specializations: string[];
  additional_services: string;
  equipment: string[] | null;
  patient_conditions: string[] | null;
  payment_methods: string[] | null;
  about: string;
  experience_years: number;
  is_online_available: boolean;
  consultation_price: string | null;
  education: EducationItem[] | null;
  work_experience: WorkExperienceItem[] | null;
  skills: string[] | null;
  is_published: boolean;
  profile_views: number;
  rating: string;
  reviews_count: number;
};

// Услуги врача (DoctorServiceRead / DoctorServiceWriteRequest)
export type DoctorServiceItem = {
  id: number;
  name: string;
  category: string;
  description: string;
  price: string | null;
  duration: number | null;
  is_active: boolean;
  created_at: string;
};

export type DoctorServiceWrite = {
  name: string;
  category: string;
  description?: string;
  price?: string | null;
  duration?: number | null;
  is_active?: boolean;
};

export type DoctorSchedule = {
  schedule: WeekSchedule;
  lunch_break: LunchBreak;
  emergency_24_7: boolean;
};

export type DoctorAppointmentPatient = {
  id: number;
  full_name: string;
  phone: string;
  avatar: string | null;
};

export type DoctorAppointment = {
  id: number;
  patient: DoctorAppointmentPatient;
  service: { id: number; name: string; price: number } | null;
  date: string;
  time: string;
  format: "offline" | "online";
  status: "upcoming" | "completed" | "cancelled";
  notes?: string;
};

export type DoctorPatient = {
  id: number;
  full_name: string;
  phone: string;
  avatar: string | null;
  last_visit: string;
  total_visits: number;
};

export type DoctorStats = {
  profile_views: number;
  profile_views_this_month: number;
  appointments_total: number;
  appointments_this_month: number;
  average_rating: number;
  reviews_count: number;
  patients_total: number;
  completion_rate: number;
};

export type DoctorAppointmentFilters = {
  status?: "upcoming" | "completed" | "cancelled" | "all";
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
};

export type DoctorPatientFilters = {
  search?: string;
  page?: number;
  page_size?: number;
};
