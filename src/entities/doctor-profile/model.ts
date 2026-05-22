export type DoctorService = {
  id: string;
  name: string;
  description: string;
  isPrimary: boolean;
};

export type DoctorAppointment = {
  id: string;
  patientName: string;
  lastVisit: string;
  status: "upcoming" | "completed";
};

export type DoctorReview = {
  id: string;
  authorName: string;
  authorInitial: string;
  rating: number;
  date: string;
  text: string;
  replyTime?: string;
  reply?: string;
};

export type DoctorProfileData = {
  fullName: string;
  photo?: string;
  specialty: string;
  additionalSpecialty: string;
  experienceYears: string;
  currentPosition: string;
  workplace: string;
  qualification: string;
  scientificDegree: string;
  gender: string;
  birthDate: string;
  city: string;
  languages: string;
  phone: string;
  email: string;
  university: string;
  graduationYear: string;
  internship: string;
  residency: string;
  diplomaSpecialty: string;
  additionalEducation: string[];
  licenseNumber: string;
  certificates: string[];
  rating: number;
  totalReviews: number;
};

export const MOCK_DOCTOR_PROFILE: DoctorProfileData = {
  fullName: "Садыкова Алена Тимуровна",
  specialty: "Терапевт",
  additionalSpecialty: "Кардиолог",
  experienceYears: "15",
  currentPosition: "Главный врач",
  workplace: "k-MEO",
  qualification: "Высшая",
  scientificDegree: "Кандидат медицинских наук",
  gender: "Женский",
  birthDate: "12.12.2001",
  city: "Бишкек",
  languages: "Русский, Английский",
  phone: "+996 500 123 456",
  email: "dr.sadykova@gmail.com",
  university: "Кыргызская Государственная Медицинская Академия",
  graduationYear: "2010",
  internship: "Терапия",
  residency: "Кардиология",
  diplomaSpecialty: "Лечебное дело",
  additionalEducation: [
    "Курсы повышения квалификации",
    "Курсы повышения квалификации",
  ],
  licenseNumber: "ЛИЦ-123456",
  certificates: [],
  rating: 4.85,
  totalReviews: 255,
};

export const MOCK_APPOINTMENTS: DoctorAppointment[] = [
  {
    id: "1",
    patientName: "Айгуль Токтогулова",
    lastVisit: "30.04.2026",
    status: "upcoming",
  },
  {
    id: "2",
    patientName: "Банат Асанов",
    lastVisit: "28.04.2026",
    status: "completed",
  },
  {
    id: "3",
    patientName: "Динара Садыкова",
    lastVisit: "09.05.2026",
    status: "upcoming",
  },
  {
    id: "4",
    patientName: "Залип Жунабаев",
    lastVisit: "22.04.2026",
    status: "completed",
  },
  {
    id: "5",
    patientName: "Нургул Алдиева",
    lastVisit: "05.05.2026",
    status: "upcoming",
  },
  {
    id: "6",
    patientName: "Азамат Кадаров",
    lastVisit: "05.05.2026",
    status: "upcoming",
  },
];

export const MOCK_SERVICES: DoctorService[] = [
  {
    id: "1",
    name: "Консультация терапевта",
    description: "Первичный приём",
    isPrimary: true,
  },
  {
    id: "2",
    name: "Повторный приём",
    description: "Консультация по вопросам здоровья",
    isPrimary: false,
  },
  {
    id: "3",
    name: "Страховая консультация",
    description: "Медицинская страховая справка",
    isPrimary: false,
  },
];

export const MOCK_REVIEWS: DoctorReview[] = [
  {
    id: "1",
    authorName: "Нурчык С.",
    authorInitial: "Н",
    rating: 5,
    date: "20 мая, 2025",
    text: "Алена Тимуровна внимательна, добра и очень тактична. Она убедилась, что на все мои вопросы даны ответы, и очень терпеливо объяснила мой диагноз.",
    replyTime: "Ответ через 2 часа",
  },
  {
    id: "2",
    authorName: "Данияр К.",
    authorInitial: "Д",
    rating: 5,
    date: "20 мая, 2025",
    text: "Алена Тимуровна внимательна, добра и очень тактична. Она убедилась, что на все мои вопросы даны ответы, и очень терпеливо объяснила мой диагноз.",
  },
];
