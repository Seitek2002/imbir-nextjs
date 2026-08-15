export type ClinicStep = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type ScheduleDay = { from: string; to: string };

export type ClinicFormData = {
  clinicName: string;
  logo: File | null;
  clinicType: string;
  description: string;
  photos: File[];

  country: string;
  city: string;
  fullAddress: string;
  phone: string;
  email: string;
  website: string;

  schedule: Record<
    "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun",
    ScheduleDay
  >;
  lunchBreak: ScheduleDay;
  emergency247: boolean;

  legalName: string;
  registrationNumber: string;
  licenseNumber: string;
  licenseDate: string;
  licensingAuthority: string;
  documents: File[];

  mainDirections: string;
  narrowDirections: string;
  additionalServices: string;

  equipment: string[];
  patientConditions: string[];
  paymentMethods: string[];

  agreeRules: boolean;
  agreePrivacy: boolean;
  agreeDataProcessing: boolean;
  agreeAccuracy: boolean;

  password: string;
  confirmPassword: string;
};

export type DoctorStep = 1 | 2 | 3 | 4;

export type DoctorFormData = {
  fullName: string;
  gender: "male" | "female" | "";
  birthDate: string;
  city: string;
  languages: string[];
  phone: string;
  email: string;
  photo: File | null;

  specialization: string;
  additionalSpecialization: string;
  experience: string;
  position: string;
  workplace: string;
  category: string;
  academicDegree: string;

  university: string;
  graduationYear: string;
  internship: string;
  residency: string;
  diplomaSpecialization: string;
  additionalEducation: string;

  certificates: File[];
  licenseNumber: string;

  password: string;
  confirmPassword: string;
};

export type InviteClinic = {
  clinicId: number;
  clinicName: string;
  clinicLogo?: string | null;
  clinicCity?: string;
  branchId: number | null;
  branchName?: string;
  branchAddress: string;
};
