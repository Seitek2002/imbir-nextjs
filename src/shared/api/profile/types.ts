import { AppointmentStatus } from "../appointments/types";

// Matches real PatientProfile schema
export type ClientProfile = {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  avatar?: string | null;
  blood_type?: string;
  allergies?: string[];
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
};

// `avatar` is read-only (a URL); the API accepts a new image via the binary
// `avatar_upload` field as multipart/form-data (see PatientProfileRequest).
export type UpdateProfileRequest = Partial<
  Omit<ClientProfile, "email" | "avatar">
> & {
  avatar_upload?: File;
};

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

export type FavoriteTargetType = "doctor" | "clinic" | "service";

// По нашей просьбе бэк добавил clinic {id, name} в врача и услугу — раньше
// карточка в «Сохранённом» не могла показать, в какой клинике приём.
export type FavoriteTargetClinic = {
  id: number;
  name: string;
};

// GET /api/profile/favorites/ отдаёт не список ссылок, а три готовых группы с
// данными карточек (проверено живым запросом), поэтому дочитывать врача или
// услугу отдельным запросом не нужно.
export type FavoriteDoctor = {
  id: number;
  full_name: string;
  specialty: string;
  photo: string | null;
  rating?: string | null;
  experience_years?: number;
  clinic: FavoriteTargetClinic;
};

export type FavoriteClinic = {
  id: number;
  name: string;
  logo: string | null;
  city?: string;
  clinic_type?: string;
  rating?: string | null;
};

export type FavoriteService = {
  id: number;
  name: string;
  category: string;
  price?: string | null;
  clinic: FavoriteTargetClinic;
};

export type FavoritesList = {
  doctors: FavoriteDoctor[];
  clinics: FavoriteClinic[];
  services: FavoriteService[];
};

// Одно и то же тело у POST (добавить) и DELETE (убрать): записи избранного не
// адресуются собственным id, бэк работает по самой цели.
export type FavoriteTargetRequest = {
  target_type: FavoriteTargetType;
  target_id: number;
};

export type PatientReview = {
  id: number;
  target_type: string;
  rating: number;
  text?: string;
  created_at: string;
};
