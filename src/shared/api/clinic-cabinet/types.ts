export type ClinicProfileBranch = {
  id: number;
  address: string;
};

// Соответствует схеме ClinicOwnProfile (GET/PUT /api/clinic/profile/) —
// плоский объект, отличается от публичной карточки клиники.
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
  schedule: Record<string, unknown>;
  lunch_break: Record<string, unknown>;
  emergency_24_7: boolean;
  legal_name: string;
  reg_number: string;
  license_number: string;
  license_date: string | null;
  license_authority: string;
  primary_specializations: string[];
  narrow_specializations: string[];
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
