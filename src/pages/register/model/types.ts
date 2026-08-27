export type ClinicStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type ScheduleDay = { allDay?: boolean; from: string; to: string };

export type ClinicFormData = {
  additionalServices: string;
  agreeAccuracy: boolean;
  agreeDataProcessing: boolean;
  agreePrivacy: boolean;
  agreeRules: boolean;

  city: string;
  clinicName: string;
  clinicType: string;
  confirmPassword: string;
  country: string;
  description: string;
  documents: File[];
  email: string;
  emergency247: boolean;

  equipment: string[];
  fullAddress: string;
  // Координаты пина с карты (shared/ui/location-picker). Строки, а не числа:
  // бэк ждёт decimal-строку, а пустая строка = «клиника точку не поставила».
  latitude: string;

  legalName: string;
  licenseDate: string;
  licenseNumber: string;
  licensingAuthority: string;
  logo: File | null;
  longitude: string;

  lunchBreak: ScheduleDay;
  // Названия из справочника специализаций (GET /api/references/specializations/),
  // выбранные через Dropdown — не свободный текст, поэтому не может
  // разойтись со справочником при резолвинге в id перед отправкой.
  mainDirections: string[];
  narrowDirections: string[];

  password: string;
  patientConditions: string[];
  paymentMethods: string[];

  phone: string;
  // PhoneInput отдаёт только цифры без кода страны, а бэку (и OTP-гейту при
  // регистрации) нужен полный номер — код держим отдельным полем и склеиваем
  // при отправке.
  phoneDialCode: string;
  photos: File[];
  registrationNumber: string;

  schedule: Record<
    "fri" | "mon" | "sat" | "sun" | "thu" | "tue" | "wed",
    ScheduleDay
  >;
  website: string;
};

export type DoctorStep = 1 | 2 | 3 | 4;

export type DoctorFormData = {
  academicDegree: string;
  additionalEducation: string;
  // Множественные: в базе это ManyToMany, и в кабинете врач уже может выбрать
  // несколько. Регистрация оставалась единственным местом, где разрешалась
  // только одна.
  additionalSpecialization: string[];
  birthDate: string;
  category: string;
  certificates: File[];
  city: string;
  confirmPassword: string;
  diplomaSpecialization: string;

  email: string;
  experience: string;
  fullName: string;
  gender: "" | "female" | "male";
  graduationYear: string;
  internship: string;
  languages: string[];

  licenseNumber: string;
  password: string;
  phone: string;
  // См. комментарий у ClinicFormData.phoneDialCode.
  phoneDialCode: string;
  photo: File | null;
  position: string;

  residency: string;
  specialization: string[];

  university: string;
  workplace: string;
};

export type InviteClinic = {
  branchAddress: string;
  branchId: null | number;
  branchName?: string;
  clinicCity?: string;
  clinicId: number;
  clinicLogo?: null | string;
  clinicName: string;
};
