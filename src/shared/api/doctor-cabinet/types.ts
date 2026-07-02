import { LunchBreak, WeekSchedule } from "../auth/types";
import { DoctorDetail } from "../doctors/types";

export type LegalInfo = {
  company_name: string;
  reg_number: string;
  license_number: string;
  license_date: string;
  license_authority: string;
  documents: string[];
};

export type DoctorPrivateProfile = DoctorDetail & {
  legal: LegalInfo;
  is_published: boolean;
  profile_views: number;
  appointments_total: number;
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
};

export type DoctorAppointment = {
  id: number;
  patient: DoctorAppointmentPatient;
  service: { id: number; name: string; price: number } | null;
  date: string;
  time: string;
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

// Соответствует схеме DoctorServiceRead / DoctorServiceWriteRequest.
export type DoctorServiceItem = {
  id: number;
  name: string;
  category: string;
  description?: string;
  price: string | null;
  duration?: number | null;
  is_active?: boolean;
  created_at?: string;
};

export type DoctorServiceBody = {
  name: string;
  category: string; // обязательное поле на бэке
  description?: string;
  price?: string;
  duration?: number;
  is_active?: boolean;
};
