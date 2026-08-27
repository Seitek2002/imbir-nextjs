import { StaticImageData } from "next/image";

// ==========================================
// ТИПЫ ДАННЫХ (КОНТРАКТ ДЛЯ БЭКЕНДА)
// ==========================================

export type ReviewItem = {
  appointmentId?: string;
  author: string;
  // id пользователя-автора. По нему страница понимает, что отзыв свой и его
  // можно удалить: имён для этого недостаточно — они повторяются. Необязательный:
  // в части ответов author приходит просто строкой, без id.
  authorId?: number;
  // Имя совпадает с пропом ReviewCard (@/widgets/reviews) — объект отдаётся
  // туда как есть, и при расхождении имён аватар молча терялся бы.
  avatarUrl?: string;
  clinicId: string;
  date: string;
  // СВЯЗИ (Foreign Keys)
  doctorId: string;
  id: string;

  rating: number;
  // Ответ врача/клиники на отзыв, если есть.
  reply?: { date: string; text: string } | null;
  serviceId?: string;

  text: string;
};

export type TimeSlot = {
  end: string; // "18:00"
  start: string; // "09:00"
} | null;

export type Schedule = {
  fri: TimeSlot;
  lunchBreak: TimeSlot;
  mon: TimeSlot;
  sat: TimeSlot;
  sun: TimeSlot;
  thu: TimeSlot;
  tue: TimeSlot;
  wed: TimeSlot;
};

export type Workplace = {
  branchId?: string;
  clinicAddress?: string;
  clinicId: string;
  clinicName: string;
  // Бэк может не отдать цену за приём — тогда блок цены прячется
  price?: number;
  schedule: Schedule;
};

export type DoctorListItem = {
  about?: string;
  contacts?: {
    email: string;
    phone: string;
    // Бэк не отдаёт расписание в публичном профиле врача — если поля нет,
    // строку не показываем, а не подставляем одинаковое время всем.
    schedule?: string;
  };
  // Детальные поля
  education?: string[];
  experience: number;
  id: number | string;
  image?: StaticImageData | string;
  isOnlineAvailable: boolean;
  name: string;
  rating: number;

  reviews: number;
  skills?: string[];
  specialty: string;
  workExperience?: {
    duration?: string;
    place: string;
    qualification?: string;
    role: string;
    // Бэк хранит work_experience как произвольный JSON — у записи может
    // быть либо диапазон лет (years/duration), либо квалификация без дат
    // (qualification), в зависимости от того, через какую форму врач это
    // заполнял. Оба варианта не гарантированы одновременно.
    years?: string;
  }[];
  workplaces: Workplace[];
};

export type Coordinates = {
  lat: number;
  lng: number;
};

export type Branch = {
  address: string;
  city?: string;
  coordinates?: Coordinates;
  id: string;
  phone?: string;
  schedule?: string;
};

export type ClinicListItem = {
  address: string;
  branches?: Branch[];
  city: string;
  coordinates: Coordinates;
  // Детальные поля
  description?: string;
  email?: string;
  experience: number;
  id: string;
  image?: StaticImageData | string;
  images?: string[];
  name: string;

  phone?: string;
  rating: number;
  reviews: number;
  schedule?: string;
  specialties: string[];
};

export type ServiceItem = {
  category: string;
  clinicId: string;
  clinicName: string;
  doctorIds: string[];
  id: string;
  image: string;
  name: string;
  // Может отсутствовать — см. parsePrice в @/shared/lib/price
  price?: number;
  rating: number;
  reviews: number;
  schedule: Schedule;
};
