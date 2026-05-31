import { ClinicDetail } from "../clinics/types";

export type ClinicPrivateProfile = ClinicDetail & {
  legal_name?: string;
  reg_number?: string;
  license_number?: string;
  license_date?: string;
  license_authority?: string;
  is_published: boolean;
  profile_views: number;
  appointments_total: number;
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

export type ClinicServiceBody = {
  name: string;
  category: string;
  description?: string;
  price: number;
  duration_minutes?: number;
  image?: string;
  doctor_ids?: number[];
  schedule?: string;
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
