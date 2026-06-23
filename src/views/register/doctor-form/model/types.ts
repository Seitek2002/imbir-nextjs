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
  clinicId: string;
  clinicName: string;
  branchId: string | null;
  branchAddress: string;
};
