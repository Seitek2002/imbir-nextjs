import { AppointmentStatus } from "../appointments/types";

// Matches real PatientProfile schema
export type ClientProfile = {
  allergies?: string[];
  avatar?: null | string;
  blood_type?: string;
  email: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relation?: string;
  first_name: string;
  last_name: string;
  patronymic?: null | string;
  phone?: string;
};

// `avatar` is read-only (a URL); the API accepts a new image via the binary
// `avatar_upload` field as multipart/form-data (see PatientProfileRequest).
export type UpdateProfileRequest = Partial<
  Omit<ClientProfile, "avatar" | "email">
> & {
  avatar_upload?: File;
};

// photo/specialty/rating/is_published бэк добавил в запись, чтобы история не
// дочитывала врача через /api/doctors/{id}/ (тот отвечает 404 для снятого с
// публикации). На старом бэке их нет — поэтому необязательные.
export type ProfileAppointmentDoctor = {
  full_name: string;
  id: number;
  is_published?: boolean;
  photo?: null | string;
  rating?: null | number | string;
  specialty?: string;
};

// address — клиники (или филиала услуги) именно этой записи; на старом бэке нет.
export type ProfileAppointmentClinic = {
  address?: string;
  id: number;
  name: string;
};

export type ProfileAppointmentService = {
  duration?: null | number;
  id: number;
  name: string;
  price?: null | number | string;
};

export type ProfileAppointment = {
  can_review: boolean;
  clinic: null | ProfileAppointmentClinic;
  created_at: string;
  date: string;
  diagnosis?: null | string;
  doctor: null | ProfileAppointmentDoctor;
  google_meet_link: null | string;
  id: number;
  is_online: boolean;
  // Вкладка «Прошедшие»: завершена, отменена или время уже прошло. На старом
  // бэке поля нет — тогда вкладку определяем по статусу.
  is_past?: boolean;
  notes?: string;
  recommendations?: null | string;
  service: null | ProfileAppointmentService;
  status: AppointmentStatus;
  time: string;
};

// Вкладка «Истории записей»: upcoming — ещё не прошедшие, ближайшая первой;
// past — завершённые, отменённые и просроченные, свежие первыми.
export type ProfileAppointmentsTab = "past" | "upcoming";

export type FavoriteTargetType = "clinic" | "doctor" | "service";

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
  clinic: FavoriteTargetClinic;
  experience_years?: number;
  full_name: string;
  id: number;
  photo: null | string;
  rating?: null | string;
  specialty: string;
};

export type FavoriteClinic = {
  city?: string;
  clinic_type?: string;
  id: number;
  logo: null | string;
  name: string;
  rating?: null | string;
};

export type FavoriteService = {
  category: string;
  clinic: FavoriteTargetClinic;
  id: number;
  name: string;
  price?: null | string;
};

export type FavoritesList = {
  clinics: FavoriteClinic[];
  doctors: FavoriteDoctor[];
  services: FavoriteService[];
};

// Одно и то же тело у POST (добавить) и DELETE (убрать): записи избранного не
// адресуются собственным id, бэк работает по самой цели.
export type FavoriteTargetRequest = {
  target_id: number;
  target_type: FavoriteTargetType;
};

export type PatientReview = {
  created_at: string;
  id: number;
  rating: number;
  target_type: string;
  text?: string;
};
