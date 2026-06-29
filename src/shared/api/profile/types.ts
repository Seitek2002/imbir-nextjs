import { AppointmentStatus } from "../appointments/types";

// Matches real PatientProfile schema
export type ClientProfile = {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  blood_type?: string;
  allergies?: string[];
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
};

export type UpdateProfileRequest = Partial<Omit<ClientProfile, "email">>;

export type ProfileAppointment = {
  id: number;
  date: string;
  time: string;
  status: AppointmentStatus;
  notes?: string;
  doctor: string;
  clinic: string;
  service: string;
  can_review: string;
  created_at: string;
  is_online: boolean;
  google_meet_link: string | null;
};

export type FavoriteItem = {
  id: number;
  target_type: "doctor" | "clinic" | "service";
  target_id: number;
  target: string;
  created_at: string;
};

export type AddFavoriteRequest = {
  target_type: "doctor" | "clinic" | "service";
  target_id: number;
};

export type PatientReview = {
  id: number;
  target_type: string;
  rating: number;
  text?: string;
  created_at: string;
};
