import { DaySchedule } from "../auth/types";

export type ClinicSchedule = {
  [day: string]: Pick<DaySchedule, "from" | "to" | "enabled">;
};

export type ClinicBranch = {
  id: string;
  address: string;
  phone?: string;
  schedule?: string;
  city?: string;
  coordinates?: { lat: number; lng: number };
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
  about: string;
  schedule: ClinicSchedule;
  equipment: string[];
  patient_conditions: string[];
  payment_methods: string[];
  location: { lat: number; lng: number } | null;
  branches: ClinicBranch[];
};

export type ClinicFilters = {
  search?: string;
  city?: string;
  specialization?: string;
  min_rating?: number;
  payment_method?: string;
  page?: number;
  page_size?: number;
};
