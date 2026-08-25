import { StaticImageData } from "next/image";

// ==========================================
// ТИПЫ ДАННЫХ (КОНТРАКТ ДЛЯ БЭКЕНДА)
// ==========================================

export type ReviewItem = {
  id: string;
  author: string;
  // Имя совпадает с пропом ReviewCard (@/widgets/reviews) — объект отдаётся
  // туда как есть, и при расхождении имён аватар молча терялся бы.
  avatarUrl?: string;
  date: string;
  text: string;
  rating: number;
  // Ответ врача/клиники на отзыв, если есть.
  reply?: { text: string; date: string } | null;

  // СВЯЗИ (Foreign Keys)
  doctorId: string;
  clinicId: string;
  serviceId?: string;

  appointmentId?: string;
};

export type TimeSlot = {
  start: string; // "09:00"
  end: string; // "18:00"
} | null;

export type Schedule = {
  mon: TimeSlot;
  tue: TimeSlot;
  wed: TimeSlot;
  thu: TimeSlot;
  fri: TimeSlot;
  sat: TimeSlot;
  sun: TimeSlot;
  lunchBreak: TimeSlot;
};

export type Workplace = {
  clinicId: string;
  clinicName: string;
  clinicAddress?: string;
  branchId?: string;
  // Бэк может не отдать цену за приём — тогда блок цены прячется
  price?: number;
  schedule: Schedule;
};

export type DoctorListItem = {
  id: string | number;
  name: string;
  specialty: string;
  workplaces: Workplace[];
  isOnlineAvailable: boolean;
  rating: number;
  reviews: number;
  experience: number;
  image?: StaticImageData | string;

  // Детальные поля
  education?: string[];
  about?: string;
  workExperience?: {
    // Бэк хранит work_experience как произвольный JSON — у записи может
    // быть либо диапазон лет (years/duration), либо квалификация без дат
    // (qualification), в зависимости от того, через какую форму врач это
    // заполнял. Оба варианта не гарантированы одновременно.
    years?: string;
    duration?: string;
    qualification?: string;
    place: string;
    role: string;
  }[];
  skills?: string[];
  contacts?: {
    // Бэк не отдаёт расписание в публичном профиле врача — если поля нет,
    // строку не показываем, а не подставляем одинаковое время всем.
    schedule?: string;
    phone: string;
    email: string;
  };
};

export type Coordinates = {
  lat: number;
  lng: number;
};

export type Branch = {
  id: string;
  address: string;
  phone?: string;
  schedule?: string;
  city?: string;
  coordinates?: Coordinates;
};

export type ClinicListItem = {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  experience: number;
  address: string;
  city: string;
  coordinates: Coordinates;
  specialties: string[];
  image?: StaticImageData | string;
  branches?: Branch[];

  // Детальные поля
  description?: string;
  schedule?: string;
  phone?: string;
  email?: string;
  images?: string[];
};

export type ServiceItem = {
  id: string;
  clinicId: string;
  clinicName: string;
  name: string;
  category: string;
  // Может отсутствовать — см. parsePrice в @/shared/lib/price
  price?: number;
  image: string;
  schedule: Schedule;
  doctorIds: string[];
  rating: number;
  reviews: number;
};
