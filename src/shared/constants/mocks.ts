import { StaticImageData } from "next/image";

import {
  ClinicImage1,
  ClinicImage2,
  ClinicImage3,
  ClinicImage4,
  DoctorImage1,
} from "../assets";

// ==========================================
// 1. ТИПЫ ДАННЫХ (КОНТРАКТ ДЛЯ БЭКЕНДА)
// ==========================================

export type ReviewItem = {
  id: string;
  author: string;
  avatar?: string; // Добавим аватарку автора для красоты
  date: string;
  text: string;
  rating: number;

  // СВЯЗИ (Foreign Keys)
  doctorId: string; // К какому врачу относится
  clinicId: string; // В какой клинике проходил прием
  serviceId?: string; // Какая услуга была оказана (опционально)

  // Для верификации (что отзыв реальный)
  appointmentId?: string;
};

export type TimeSlot = {
  start: string; // "09:00"
  end: string; // "18:00"
} | null;

// Полный график на неделю + обед
export type Schedule = {
  mon: TimeSlot;
  tue: TimeSlot;
  wed: TimeSlot;
  thu: TimeSlot;
  fri: TimeSlot;
  sat: TimeSlot;
  sun: TimeSlot;
  lunchBreak: TimeSlot; // Один обед на всю неделю, как на твоем макете
};

export type Workplace = {
  clinicId: string;
  clinicName: string;
  price: number;
  schedule: Schedule;
};

export type DoctorListItem = {
  id: string | number;
  name: string;
  specialty: string;
  workplaces: Workplace[]; // <-- МАССИВ КЛИНИК И ЦЕН
  isOnlineAvailable: boolean; // <-- ФЛАГ ОНЛАЙН ПРИЕМА
  rating: number;
  reviews: number;
  experience: number;
  image?: StaticImageData | any | string; // <-- Заменил на any | string
};

export type ClinicListItem = {
  id: string | number;
  name: string;
  rating: number;
  reviews: number;
  experience: number;
  address: string;
  specialties: string[];
  image?: StaticImageData | any | string;
};

export type ServiceItem = {
  id: string;
  clinicId: string;
  name: string;
  category: string;
  price: number;
  image: string;
  schedule: Schedule;
  doctorIds: string[];
  rating: number;
  reviews: number;
};

// ==========================================
// 2. СПИСКИ (ДЛЯ ГЛАВНОЙ СТРАНИЦЫ И ПОИСКА)
// ==========================================

export const MOCK_SPECIALISTS: DoctorListItem[] = [
  {
    id: "1",
    name: "Айбеков Нурлан",
    specialty: "Кардиолог",
    workplaces: [
      {
        clinicId: "1",
        clinicName: "Nova Clinic",
        price: 2500,
        schedule: {
          mon: { start: "09:00", end: "15:00" },
          tue: null,
          wed: { start: "09:00", end: "15:00" },
          thu: null,
          fri: { start: "09:00", end: "15:00" },
          sat: null,
          sun: null,
          lunchBreak: { start: "13:00", end: "14:00" },
        },
      },
      {
        clinicId: "2",
        clinicName: "K-MED",
        price: 2000,
        schedule: {
          mon: null,
          tue: { start: "10:00", end: "18:00" },
          wed: null,
          thu: { start: "10:00", end: "18:00" },
          fri: null,
          sat: { start: "10:00", end: "14:00" },
          sun: null,
          lunchBreak: { start: "14:00", end: "15:00" },
        },
      },
    ],
    isOnlineAvailable: true,
    rating: 4.9,
    reviews: 128,
    experience: 15,
    image: "https://i.pravatar.cc/150?u=a042581f4e29026024d",
  },
  {
    id: "2",
    name: "Садыкова Алина",
    specialty: "Врач-терапевт",
    workplaces: [
      {
        clinicId: "3",
        clinicName: "MED Clinic",
        price: 1500,
        schedule: {
          mon: { start: "08:00", end: "16:00" },
          tue: { start: "08:00", end: "16:00" },
          wed: { start: "08:00", end: "16:00" },
          thu: { start: "08:00", end: "16:00" },
          fri: { start: "08:00", end: "16:00" },
          sat: null,
          sun: null,
          lunchBreak: { start: "12:00", end: "13:00" },
        },
      },
    ],
    isOnlineAvailable: false,
    rating: 4.85,
    reviews: 255,
    experience: 12,
    image: "https://i.pravatar.cc/150?u=a04258114e29026702d",
  },
];

export const MOCK_CLINICS: ClinicListItem[] = [
  {
    id: "1",
    name: "Nova Clinic",
    rating: 4.9,
    reviews: 1024,
    experience: 15,
    address: "ул. Московская, 189",
    specialties: ["Кардиолог", "Врач-терапевт", "Хирург"],
    image: ClinicImage1.src,
  },
  {
    id: "2",
    name: "K-MED",
    rating: 4.5,
    reviews: 340,
    experience: 8,
    address: "ул. Байтик Баатыра, 70",
    specialties: ["Педиатр", "Врач-терапевт"],
    image: ClinicImage2.src,
  },
  {
    id: "3",
    name: "Med Center",
    rating: 4.8,
    reviews: 890,
    experience: 20,
    address: "пр. Чуй, 115",
    specialties: ["Хирург", "Кардиолог"],
    image: ClinicImage3.src,
  },
  {
    id: "4",
    name: "City Health",
    rating: 4.2,
    reviews: 156,
    experience: 5,
    address: "ул. Ахунбаева, 127",
    specialties: ["Врач-терапевт"],
    image: ClinicImage4.src,
  },
];

export const MOCK_SERVICES: ServiceItem[] = [
  {
    id: "1",
    clinicId: "3",
    name: "Анализ крови",
    category: "Лаборатория",
    price: 800,
    image: "https://placehold.co/400x300/E3E4E5/838A8D?text=Lab",
    schedule: {
      mon: { start: "07:00", end: "12:00" },
      tue: { start: "07:00", end: "12:00" },
      wed: { start: "07:00", end: "12:00" },
      thu: { start: "07:00", end: "12:00" },
      fri: { start: "07:00", end: "12:00" },
      sat: null,
      sun: null,
      lunchBreak: null,
    },
    doctorIds: ["2"],
    rating: 4.9,
    reviews: 1200,
  },
  {
    id: "2",
    clinicId: "1",
    name: "ЭКГ",
    category: "Кардиология",
    price: 1500,
    image: "https://placehold.co/400x300/E3E4E5/838A8D?text=ECG",
    schedule: {
      mon: { start: "09:00", end: "18:00" },
      tue: { start: "09:00", end: "18:00" },
      wed: { start: "09:00", end: "18:00" },
      thu: { start: "09:00", end: "18:00" },
      fri: { start: "09:00", end: "18:00" },
      sat: null,
      sun: null,
      lunchBreak: { start: "13:00", end: "14:00" },
    },
    doctorIds: ["1"],
    rating: 4.8,
    reviews: 340,
  },
];

export const MOCK_REVIEWS: ReviewItem[] = [
  {
    id: 1,
    author: "Нуркыз Сабырбекова",
    date: "23 Ноября, 2025",
    text: "Алина Тимуровна замечательный, добрый и очень тщательный врач...",
    rating: 5,
  },
  {
    id: 2,
    author: "Данияр Джумашов",
    date: "15 Октября, 2025",
    text: "Отличный специалист. Внимательно выслушал все жалобы...",
    rating: 4,
  },
];

// Детальные данные пока оставляем как есть, мы их переделаем, когда дойдем до страницы врача
export const MOCK_DOCTOR = {
  id: "1",
  name: "Садыкова Алина Тимуровна",
  specialty: "Врач-кардиолог",
  workplaces: [
    { clinicId: "1", clinicName: "Nova Clinic", price: 2000 },
    { clinicId: "2", clinicName: "K-MED", price: 2500 },
  ],
  isOnlineAvailable: true,
  rating: 4.85,
  experience: 12,
  reviewsCount: 255,
  image: DoctorImage1, // Тут останется объект картинки
  education:
    "Кыргызская Государственная Медицинская Академия, факультет лечебного дела (окончила с отличием)",
  about:
    "Опытный кардиолог с более чем 12-летней практикой. Специализируется на диагностике и лечении сердечно-сосудистых заболеваний...",
  workExperience: [
    {
      years: "2012-2020",
      duration: "(8 лет)",
      place: "Национальный центр кардиологии",
      role: "Кардиолог",
    },
    {
      years: "2020-2024",
      duration: "(4 года)",
      place: "Частная клиника «Медицина»",
      role: "Ведущий кардиолог",
    },
  ],
  skills: [
    "Диагностика и лечение заболеваний сердечно-сосудистой системы",
    "ЭКГ, ЭХО-КГ, нагрузочные тесты",
    "Составление индивидуальных программ реабилитации",
  ],
  contacts: {
    schedule: "ПН-ПТ • 08:00-17:00",
    phone: "+996 700 123 456",
    email: "dr.sadykova@gmail.com",
  },
};
export const MOCK_CLINIC = {
  id: "1",
  name: "MED Clinic",
  type: "Многопрофильная клиника",
  address: "ул. Московская, 189",
  schedule: "ПН-ПТ • 08:00-17:00",
  rating: 4.85,
  experience: 12,
  reviewsCount: 255,
  images: [
    "/placeholder-1.jpg",
    "/placeholder-2.jpg",
    "/placeholder-3.jpg",
    "/placeholder-4.jpg",
  ],
  about:
    "Наша клиника — это современная медицинская помощь, опытные врачи и индивидуальный подход к каждому пациенту. Мы используем проверенные методы и технологии для того, чтобы обеспечить точную диагностику, эффективное лечение и комфорт на каждом этапе. У нас работают только лучшие специалисты своего дела.",
  contacts: {
    schedule: "ПН-ПТ • 08:00-17:00",
    address: "ул. Московская, 189",
    phone: "+996 700 123 456",
    email: "dr.sadykova@gmail.com",
  },
};
