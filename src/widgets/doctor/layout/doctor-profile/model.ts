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
  // Фото автора, если он его загрузил. Иначе рисуем authorInitial.
  authorAvatarUrl?: string;
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
  // CSV-строки для формы («УЗИ, ЭКГ») — API хранит массивы.
  equipment: string;
  patientConditions: string;
  paymentMethods: string;
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
