import { StaticImageData } from "next/image";

import {
  ClinicImage1,
  ClinicImage2,
  ClinicImage3,
  ClinicImage4,
  DoctorImage1,
  DoctorImage2,
  DoctorImage3,
  DoctorImage4,
} from "../assets";

// ==========================================
// 1. ТИПЫ ДАННЫХ (КОНТРАКТ ДЛЯ БЭКЕНДА)
// ==========================================

export type DoctorListItem = {
  id: string | number;
  name: string;
  specialty: string;
  clinic: string;
  rating: number;
  reviews: number;
  experience: number;
  price: number;
  image?: StaticImageData | string;
};

export type ClinicListItem = {
  id: string | number;
  name: string;
  rating: number;
  reviews: number;
  experience: number;
  address: string;
  specialties: string[];
  image?: StaticImageData | string;
};

export type ServiceItem = {
  id: string | number;
  name: string;
  category: string;
  price: string; // Можно переделать в number, если потом будете фильтровать по цене
  rating: number;
  reviews: number;
};

export type ReviewItem = {
  id: string | number;
  author: string;
  date: string;
  text: string;
  rating: number;
};

// ==========================================
// 2. СПИСКИ (ДЛЯ ГЛАВНОЙ СТРАНИЦЫ И ПОИСКА)
// ==========================================

export const MOCK_SPECIALISTS: DoctorListItem[] = [
  {
    id: 1,
    name: "Айбеков Нурлан",
    specialty: "Кардиолог",
    clinic: "Nova Clinic",
    rating: 4.9,
    reviews: 128,
    experience: 15,
    price: 2500,
    image: DoctorImage1,
  },
  {
    id: 2,
    name: "Садыкова Алина",
    specialty: "Врач-терапевт",
    clinic: "MED Clinic",
    rating: 4.85,
    reviews: 255,
    experience: 12,
    price: 1500,
    image: DoctorImage2,
  },
  {
    id: 3,
    name: "Жумабаев Данияр",
    specialty: "Хирург",
    clinic: "BioMed",
    rating: 4.2,
    reviews: 45,
    experience: 8,
    price: 3000,
    image: DoctorImage3,
  },
  {
    id: 4,
    name: "Калиева Айгерим",
    specialty: "Педиатр",
    clinic: "HealthPlus",
    rating: 5.0,
    reviews: 312,
    experience: 20,
    price: 2000,
    image: DoctorImage4,
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
    specialties: ["Кардиолог", "Врач-терапевт", "Хирург"], // Многопрофильная
    image: ClinicImage1.src,
  },
  {
    id: "2",
    name: "K-MED",
    rating: 4.5,
    reviews: 340,
    experience: 8,
    address: "ул. Байтик Баатыра, 70",
    specialties: ["Педиатр", "Врач-терапевт"], // Семейная
    image: ClinicImage2.src,
  },
  {
    id: "3",
    name: "Med Center",
    rating: 4.8,
    reviews: 890,
    experience: 20,
    address: "пр. Чуй, 115",
    specialties: ["Хирург", "Кардиолог"], // Специализированная
    image: ClinicImage3.src,
  },
  {
    id: "4",
    name: "City Health",
    rating: 4.2,
    reviews: 156,
    experience: 5,
    address: "ул. Ахунбаева, 127",
    specialties: ["Врач-терапевт"], // Только терапия
    image: ClinicImage4.src,
  },
];

export const MOCK_SERVICES: ServiceItem[] = [
  {
    id: 1,
    name: "Анализ крови",
    category: "Лаборатория • MED Clinic",
    price: "800 c",
    rating: 4.9,
    reviews: 1200,
  },
  {
    id: 2,
    name: "Аудиометрия",
    category: "Медицина • MED Clinic",
    price: "1500 c",
    rating: 4.7,
    reviews: 340,
  },
  {
    id: 3,
    name: "Биопсия",
    category: "Хирургия • MED Clinic",
    price: "4500 c",
    rating: 4.8,
    reviews: 150,
  },
  {
    id: 4,
    name: "УЗИ брюшной полости",
    category: "УЗИ • MED Clinic",
    price: "1200 c",
    rating: 4.6,
    reviews: 580,
  },
];

export const MOCK_REVIEWS: ReviewItem[] = [
  {
    id: 1,
    author: "Нуркыз Сабырбекова",
    date: "23 Ноября, 2025",
    text: "Алина Тимуровна замечательный, добрый и очень тщательный врач. Она убедилась, что на все мои вопросы даны ответы, и очень терпеливо объяснила мой диагноз.",
    rating: 5,
  },
  {
    id: 2,
    author: "Данияр Джумашов",
    date: "15 Октября, 2025",
    text: "Отличный специалист. Внимательно выслушал все жалобы и назначил эффективное лечение. Рекомендую!",
    rating: 4,
  },
];

// ==========================================
// 3. ДЕТАЛЬНЫЕ ДАННЫЕ (ДЛЯ СТРАНИЦ [id])
// ==========================================

export const MOCK_DOCTOR = {
  id: "1",
  name: "Садыкова Алина Тимуровна",
  specialty: "Врач-кардиолог",
  rating: 4.85,
  experience: 12,
  reviewsCount: 255,
  image: DoctorImage1,
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
