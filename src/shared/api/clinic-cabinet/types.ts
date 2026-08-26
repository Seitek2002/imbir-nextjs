import type { SpecializationItem } from "../references/types";
import type { ServiceListItem } from "../services/types";

export type ClinicProfileBranch = {
  address: string;
  id: number;
};

export type ClinicDocument = {
  id: number;
  uploaded_at: string;
  url: string;
};

export type ClinicPhoto = {
  id: number;
  uploaded_at: string;
  url: string;
};

// Соответствует реальному ответу GET/PUT /api/clinic/profile/ — плоский
// объект, ОТЛИЧАЕТСЯ от публичной карточки клиники (ClinicDetail), у которой
// другие имена полей (about вместо description, нет id и т.д.). Не путать!
export type ClinicPrivateProfile = {
  additional_services: string;
  address: string;
  branches: ClinicProfileBranch[];
  city: string;
  clinic_type: string;
  country: string;
  description: string;
  doctors_count: number;
  email: string;
  emergency_24_7: boolean;
  equipment: string[];
  experience_years: number;
  id?: number;
  is_published: boolean;
  latitude: null | string;
  legal_name: string;
  license_authority: string;
  license_date: null | string;
  license_number: string;
  logo: null | string;
  longitude: null | string;
  lunch_break: { from: string; to: string } | null;
  name: string;
  narrow_specializations: SpecializationItem[];
  patient_conditions: string[];
  payment_methods: string[];
  phone: string;
  // Объекты {id, name, photo} на чтение; на запись PUT принимает отдельные
  // поля primary_specialization_ids/narrow_specialization_ids (числа) — см.
  // UpdateClinicProfileBody.
  primary_specializations: SpecializationItem[];
  profile_views: number;
  rating: string;
  reg_number: string;
  reviews_count: number;
  schedule: Record<string, { enabled: boolean; from: string; to: string }>;
  website: string;
};

export type ClinicDoctorItem = {
  appointments_total: number;
  full_name: string;
  id: number;
  is_active: boolean;
  photo: null | string;
  rating: number;
  specialty: string;
};

// Филиал, где проводится процедура. На запись — branch_id, на чтение бэк
// отдаёт объект с готовыми названием и адресом.
export type ClinicServiceBranch = {
  address: string;
  id: number;
  name: string;
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
  branch_id?: null | number;
  category: string;
  description?: string;
  doctor_ids?: number[];
  duration?: null | number;
  is_active?: boolean;
  lunch_break?: ClinicLunchBreak | null;
  name: string;
  // Появились после доработки бэка: фото процедуры, филиал проведения и
  // собственный график. photo принимает и File (multipart), и URL-строку.
  photo?: File | null | string;
  price?: null | string;
  schedule?: null | Record<string, ClinicScheduleDay>;
};

// Врач в ответе услуги (POST/PUT/GET возвращают услугу с doctors[]).
export type ClinicServiceDoctor = {
  full_name: string;
  id: number;
};

// Услуга в кабинете клиники = публичная услуга + назначенные врачи.
// doctors приходит и в списке, и в ответе создания/обновления.
export type ClinicServiceListItem = ServiceListItem & {
  description?: string;
  doctors?: ClinicServiceDoctor[];
  is_active?: boolean;
};

// Ответ создания/обновления услуги клиники (с назначенными врачами).
export type ClinicServiceResponse = {
  category: string;
  created_at: string;
  doctors: ClinicServiceDoctor[];
  id: number;
  name: string;
  price: null | string;
};

// GET /api/clinic/services/{id}/ — полная карточка процедуры.
export type ClinicServiceDetail = {
  branch: ClinicServiceBranch | null;
  category: string;
  created_at: string;
  description?: string;
  doctors: ClinicServiceDoctor[];
  duration: null | number;
  id: number;
  is_active: boolean;
  lunch_break: ClinicLunchBreak | null;
  name: string;
  photo: null | string;
  price: null | string;
  schedule: null | Record<string, ClinicScheduleDay>;
};

// Запись образования врача. Интернатура/ординатура/специализация по диплому
// лежат тут же отдельными ключами — в отличие от кабинета самого врача, где
// бэк принимает только плоский массив institution/degree/year.
export type ClinicDoctorEducation = {
  diploma_specialization?: string;
  institution?: string;
  internship?: string;
  residency?: string;
  year?: null | number;
};

export type ClinicDoctorCourse = {
  name?: string;
  year?: null | number;
};

// Поля карточки врача, которые заполняет клиника. Логин (email/пароль),
// график приёма и цена консультации сюда НЕ входят — их меняет только сам
// врач через /api/doctor/profile/, бэк их здесь не примет.
export type ClinicDoctorProfileBody = {
  academic_degree?: string;
  additional_education?: ClinicDoctorCourse[];
  birth_date?: null | string;
  city?: string;
  education?: ClinicDoctorEducation[];
  experience_years?: number;
  gender?: string;
  languages?: string[];
  license_number?: string;
  narrow_specialization_ids?: number[];
  // Как и логотип клиники: File уходит multipart'ом, строка — это URL уже
  // загруженной картинки.
  photo?: File | null | string;
  position?: string;
  primary_specialization_ids?: number[];
  qualification_category?: string;
};

// GET /api/clinic/doctors/{id}/ — полная карточка прикреплённого врача.
// Поля из ClinicDoctorProfileBody на чтение приходят как есть, кроме
// специализаций: пишутся *_ids, читаются объектами.
export type ClinicDoctorProfile = Omit<
  ClinicDoctorProfileBody,
  "narrow_specialization_ids" | "photo" | "primary_specialization_ids"
> & {
  email: string;
  first_name: string;
  full_name: string;
  id: number;
  last_name: string;
  narrow_specializations: SpecializationItem[];
  // Отчество бэк отдаёт только на чтение: при создании врача его передать
  // некуда (в ClinicDoctorCreateRequest поля нет), поэтому у заведённого из
  // кабинета врача оно приходит null — схема обещает string, но проверено
  // живым запросом, что бывает и null.
  patronymic: null | string;
  phone: string;
  photo: null | string;
  primary_specializations: SpecializationItem[];
};

// POST /api/clinic/doctors/ — регистрация врача клиникой из кабинета.
// password необязателен (по умолчанию бэк ставит "Doctor123!"). Почта и
// телефон должны быть уникальны — иначе 400. Профильные поля опциональны:
// можно завести врача одним запросом сразу с заполненной карточкой.
export type CreateClinicDoctorRequest = ClinicDoctorProfileBody & {
  email: string;
  first_name: string;
  last_name: string;
  password?: string;
  phone?: string;
};

export type ClinicAppointmentFilters = {
  date_from?: string;
  date_to?: string;
  doctor_id?: number;
  page?: number;
  page_size?: number;
  status?: string;
};

export type ClinicStats = {
  appointments_this_month: number;
  appointments_total: number;
  average_rating: number;
  doctors_count: number;
  patients_total: number;
  profile_views: number;
  profile_views_this_month: number;
  revenue_this_month: number;
  reviews_count: number;
};

// Real API: branch is integer, has is_valid field
export type InviteLink = {
  branch: null | number;
  created_at: string;
  expires_at: null | string;
  id: string;
  is_active: boolean;
  is_valid: boolean;
};

export type CreateInviteRequest = {
  branch?: null | number;
  expires_at?: null | string;
};

export type UpdateBranchRequest = {
  address?: string;
  phone?: string;
  schedule?: string;
};
