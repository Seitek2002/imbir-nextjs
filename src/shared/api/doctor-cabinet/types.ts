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

export type DoctorServiceItem = {
  id: number;
  name: string;
  description?: string;
  price: number | null;
  duration_minutes?: number;
  is_primary: boolean;
};

export type DoctorServiceBody = {
  name: string;
  description?: string;
  price?: number;
  duration_minutes?: number;
  is_primary?: boolean;
};
