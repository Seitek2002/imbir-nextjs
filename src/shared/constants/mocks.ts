import { DoctorImage1 } from "../assets";

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

export const MOCK_SERVICES = [
  {
    id: 1,
    name: "Анализ крови",
    category: "Медицина • MED Clinic",
    price: "1700 c",
    rating: 4.85,
    reviews: 255,
  },
  {
    id: 2,
    name: "Аудиометрия",
    category: "Медицина • MED Clinic",
    price: "1700 c",
    rating: 4.85,
    reviews: 255,
  },
  {
    id: 3,
    name: "Биопсия",
    category: "Хирургия • MED Clinic",
    price: "1700 c",
    rating: 4.85,
    reviews: 255,
  },
  {
    id: 4,
    name: "УЗИ",
    category: "УЗИ • MED Clinic",
    price: "1700 c",
    rating: 4.85,
    reviews: 255,
  },
];

export const MOCK_SPECIALISTS = [
  {
    id: 1,
    name: "Айбеков Нурлан",
    specialty: "Врач-терапевт",
    rating: 4.85,
    reviews: 255,
    experience: 12,
  },
  {
    id: 2,
    name: "Садыкова Алина",
    specialty: "Врач-терапевт",
    rating: 4.85,
    reviews: 255,
    experience: 12,
  },
  {
    id: 3,
    name: "Жумабаев Данияр",
    specialty: "Врач-терапевт",
    rating: 4.85,
    reviews: 255,
    experience: 12,
  },
  {
    id: 4,
    name: "Калиева Айгерим",
    specialty: "Врач-терапевт",
    rating: 4.85,
    reviews: 255,
    experience: 12,
  },
];

export const MOCK_REVIEWS = [
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
    date: "23 Ноября, 2025",
    text: "Алина Тимуровна замечательный, добрый и очень тщательный врач...",
    rating: 5,
  },
];

export const MOCK_DOCTOR = {
  id: "1",
  name: "Садыкова Алина Тимуровна",
  specialty: "Врач-кардиолог",
  rating: 4.85,
  experience: 12,
  reviewsCount: 255,
  image: DoctorImage1, // или "/assets/doctor-large.png"
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
