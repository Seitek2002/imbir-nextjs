import type { SpecializationItem } from "../references/types";
import type { ServiceListItem } from "../services/types";

export type ClinicProfileBranch = {
  id: number;
  address: string;
};

export type ClinicDocument = {
  id: number;
  url: string;
  uploaded_at: string;
};

export type ClinicPhoto = {
  id: number;
  url: string;
  uploaded_at: string;
};

// Соответствует реальному ответу GET/PUT /api/clinic/profile/ — плоский
// объект, ОТЛИЧАЕТСЯ от публичной карточки клиники (ClinicDetail), у которой
// другие имена полей (about вместо description, нет id и т.д.). Не путать!
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
  schedule: Record<string, { from: string; to: string; enabled: boolean }>;
  lunch_break: { from: string; to: string } | null;
  emergency_24_7: boolean;
  legal_name: string;
  reg_number: string;
  license_number: string;
  license_date: string | null;
  license_authority: string;
  // Объекты {id, name, photo} на чтение; на запись PUT принимает отдельные
  // поля primary_specialization_ids/narrow_specialization_ids (числа) — см.
  // UpdateClinicProfileBody.
  primary_specializations: SpecializationItem[];
  narrow_specializations: SpecializationItem[];
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

// Филиал, где проводится процедура. На запись — branch_id, на чтение бэк
// отдаёт объект с готовыми названием и адресом.
export type ClinicServiceBranch = {
  id: number;
  name: string;
  address: string;
};

// График процедуры: по дню недели, ключи английские (monday…sunday).
export type ClinicScheduleDay = {
  enabled: boolean;
  from: string;
  to: string;
};

export type ClinicLunchBreak = { from: string; to: string };

// POST/PUT /api/clinic/services/. doctor_ids — список User ID врачей ЭТОЙ
// клиники, которым назначается услуга (при PUT старые связи заменяются на
// новые). Допускаются только врачи, привязанные к клинике через
// DoctorClinicLink — иначе бэк вернёт 400.
export type ClinicServiceBody = {
  name: string;
  category: string;
  description?: string;
  price?: string | null;
  duration?: number | null;
  is_active?: boolean;
  doctor_ids?: number[];
  // Появились после доработки бэка: фото процедуры, филиал проведения и
  // собственный график. photo принимает и File (multipart), и URL-строку.
  photo?: File | string | null;
  branch_id?: number | null;
  schedule?: Record<string, ClinicScheduleDay> | null;
  lunch_break?: ClinicLunchBreak | null;
};

// Врач в ответе услуги (POST/PUT/GET возвращают услугу с doctors[]).
export type ClinicServiceDoctor = {
  id: number;
  full_name: string;
};

// Услуга в кабинете клиники = публичная услуга + назначенные врачи.
// doctors приходит и в списке, и в ответе создания/обновления.
export type ClinicServiceListItem = ServiceListItem & {
  doctors?: ClinicServiceDoctor[];
  description?: string;
  is_active?: boolean;
};

// Ответ создания/обновления услуги клиники (с назначенными врачами).
export type ClinicServiceResponse = {
  id: number;
  name: string;
  category: string;
  price: string | null;
  doctors: ClinicServiceDoctor[];
  created_at: string;
};

// GET /api/clinic/services/{id}/ — полная карточка процедуры.
export type ClinicServiceDetail = {
  id: number;
  name: string;
  category: string;
  description?: string;
  price: string | null;
  duration: number | null;
  photo: string | null;
  branch: ClinicServiceBranch | null;
  schedule: Record<string, ClinicScheduleDay> | null;
  lunch_break: ClinicLunchBreak | null;
  is_active: boolean;
  doctors: ClinicServiceDoctor[];
  created_at: string;
};

// Запись образования врача. Интернатура/ординатура/специализация по диплому
// лежат тут же отдельными ключами — в отличие от кабинета самого врача, где
// бэк принимает только плоский массив institution/degree/year.
export type ClinicDoctorEducation = {
  institution?: string;
  year?: number | null;
  internship?: string;
  residency?: string;
  diploma_specialization?: string;
};

export type ClinicDoctorCourse = {
  name?: string;
  year?: number | null;
};

// Поля карточки врача, которые заполняет клиника. Логин (email/пароль),
// график приёма и цена консультации сюда НЕ входят — их меняет только сам
// врач через /api/doctor/profile/, бэк их здесь не примет.
export type ClinicDoctorProfileBody = {
  gender?: string;
  birth_date?: string | null;
  city?: string;
  languages?: string[];
  // Как и логотип клиники: File уходит multipart'ом, строка — это URL уже
  // загруженной картинки.
  photo?: File | string | null;
  primary_specialization_ids?: number[];
  narrow_specialization_ids?: number[];
  experience_years?: number;
  position?: string;
  qualification_category?: string;
  academic_degree?: string;
  education?: ClinicDoctorEducation[];
  additional_education?: ClinicDoctorCourse[];
  license_number?: string;
};

// GET /api/clinic/doctors/{id}/ — полная карточка прикреплённого врача.
// Поля из ClinicDoctorProfileBody на чтение приходят как есть, кроме
// специализаций: пишутся *_ids, читаются объектами.
export type ClinicDoctorProfile = Omit<
  ClinicDoctorProfileBody,
  "photo" | "primary_specialization_ids" | "narrow_specialization_ids"
> & {
  id: number;
  first_name: string;
  last_name: string;
  // Отчество бэк теперь хранит и отдаёт — но только на чтение: при создании
  // врача его передать нельзя (в ClinicDoctorCreateRequest поля нет).
  patronymic: string;
  full_name: string;
  email: string;
  phone: string;
  photo: string | null;
  primary_specializations: SpecializationItem[];
  narrow_specializations: SpecializationItem[];
};

// POST /api/clinic/doctors/ — регистрация врача клиникой из кабинета.
// password необязателен (по умолчанию бэк ставит "Doctor123!"). Почта и
// телефон должны быть уникальны — иначе 400. Профильные поля опциональны:
// можно завести врача одним запросом сразу с заполненной карточкой.
export type CreateClinicDoctorRequest = ClinicDoctorProfileBody & {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  password?: string;
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
  branch?: number | null;
  expires_at?: string | null;
};

export type UpdateBranchRequest = {
  address?: string;
  phone?: string;
  schedule?: string;
};
