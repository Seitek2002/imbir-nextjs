export type DoctorService = {
  description: string;
  id: string;
  isPrimary: boolean;
  name: string;
};

export type DoctorAppointment = {
  id: string;
  lastVisit: string;
  patientName: string;
  status: "completed" | "upcoming";
};

export type DoctorReview = {
  // Фото автора, если он его загрузил. Иначе рисуем authorInitial.
  authorAvatarUrl?: string;
  authorInitial: string;
  authorName: string;
  date: string;
  id: string;
  rating: number;
  reply?: string;
  replyTime?: string;
  text: string;
};

export type DoctorProfileData = {
  additionalEducation: { name: string; year: string }[];
  // Множественные: в базе это ManyToMany (primary_specializations /
  // narrow_specializations), и у клиники форма давно умеет выбирать несколько.
  // У врача до этого бралась только первая — остальные не показывались и
  // терялись при первом же сохранении профиля.
  additionalSpecialty: string[];
  birthDate: string;
  certificates: string[];
  city: string;
  consultationPrice: string;
  currentPosition: string;
  diplomaSpecialty: string;
  email: string;
  // Названия из справочника (GET /api/references/equipment|conditions|
  // payment-methods/), выбранные через CheckboxGroup — не свободный текст.
  equipment: string[];
  experienceYears: string;
  fullName: string;
  gender: string;
  graduationYear: string;
  internship: string;
  // Приём онлайн, цена видеоконсультации и публикация профиля в каталоге.
  // Всё три — писчие поля /api/doctor/profile/, редактируются в секции
  // «Профессиональные данные».
  isOnlineAvailable: boolean;
  isPublished: boolean;
  languages: string;
  licenseNumber: string;
  patientConditions: string[];
  paymentMethods: string[];
  phone: string;
  photo?: string;
  qualification: string;
  rating: number;
  residency: string;
  scientificDegree: string;
  specialty: string[];
  totalReviews: number;
  university: string;
  workplace: string;
};
