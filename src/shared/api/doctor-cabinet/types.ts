import { LunchBreak, WeekSchedule } from "../auth/types";
import { DoctorDetail } from "../doctors/types";

export type LegalInfo = {
  company_name: string;
  documents: string[];
  license_authority: string;
  license_date: string;
  license_number: string;
  reg_number: string;
};

export type DoctorPrivateProfile = DoctorDetail & {
  appointments_total: number;
  is_published: boolean;
  legal: LegalInfo;
  profile_views: number;
};

// GET/POST /api/doctor/documents/ (схема DoctorDocumentOut).
export type DoctorDocument = {
  id: number;
  uploaded_at: string;
  url: string;
};

export type DoctorSchedule = {
  emergency_24_7: boolean;
  lunch_break: LunchBreak;
  schedule: WeekSchedule;
};

export type DoctorAppointmentPatient = {
  full_name: string;
  id: number;
  phone: string;
};

export type DoctorAppointment = {
  date: string;
  id: number;
  notes?: string;
  patient: DoctorAppointmentPatient;
  service: { id: number; name: string; price: number } | null;
  status:
    | "cancelled"
    | "completed"
    | "confirmed"
    | "pending"
    | "scheduled"
    | "upcoming";
  time: string;
};

export type DoctorPatient = {
  avatar: null | string;
  full_name: string;
  id: number;
  last_visit: string;
  phone: string;
  total_visits: number;
};

// Реальный ответ GET /api/doctor/stats/ (проверен живым запросом) — плоский,
// записи приходят с разбивкой по статусам.
export type DoctorStats = {
  appointments: {
    cancelled: number;
    completed: number;
    confirmed: number;
    pending: number;
    total: number;
  };
  completion_rate: number;
  patients_count: number;
  profile_views: number;
  rating: number;
  reviews_count: number;
};

// Итоги приёма (GET/PATCH /api/doctor/appointments/{id}/summary/).
export type DoctorAppointmentSummary = {
  diagnosis: string;
  doctor_notes: string;
  recommendations: string;
};

export type DoctorAppointmentFilters = {
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
  status?: "all" | "cancelled" | "completed" | "upcoming";
};

export type DoctorPatientFilters = {
  page?: number;
  page_size?: number;
  search?: string;
};

// Соответствует схеме DoctorServiceRead / DoctorServiceWriteRequest.
export type DoctorServiceItem = {
  category: string;
  created_at?: string;
  description?: string;
  duration?: null | number;
  id: number;
  is_active?: boolean;
  name: string;
  photo?: null | string;
  price: null | string;
};

export type DoctorServiceBody = {
  category: string; // обязательное поле на бэке
  description?: string;
  duration?: number;
  is_active?: boolean;
  name: string;
  // File уходит multipart'ом, строка — URL уже загруженной картинки.
  photo?: File | null | string;
  price?: string;
};
