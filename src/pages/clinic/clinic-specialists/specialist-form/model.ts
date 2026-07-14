// Локальная модель формы «специалист клиники» — поля с макета «Добавить
// специалиста». Бэк пока не отдаёт и не принимает большинство этих полей для
// врача со стороны клиники (см. shared-ui.tsx для деталей), поэтому это
// чисто клиентское состояние формы, без серверной персистенции.
export type SpecialistFormState = {
  fullName: string;
  gender: string;
  birthDate: string;
  city: string;
  languages: string;
  phone: string;
  email: string;
  photoPreview?: string;

  specialization: string;
  additionalSpecialization: string;
  experienceYears: string;
  position: string;
  workplace: string;
  qualification: string;
  degree: string;

  university: string;
  graduationYear: string;
  internship: string;
  residency: string;
  diplomaSpecialty: string;
  additionalEducation: string;

  licenseNumber: string;
};

export const EMPTY_SPECIALIST_FORM: SpecialistFormState = {
  fullName: "",
  gender: "",
  birthDate: "",
  city: "",
  languages: "",
  phone: "",
  email: "",
  photoPreview: undefined,
  specialization: "",
  additionalSpecialization: "",
  experienceYears: "",
  position: "",
  workplace: "",
  qualification: "",
  degree: "",
  university: "",
  graduationYear: "",
  internship: "",
  residency: "",
  diplomaSpecialty: "",
  additionalEducation: "",
  licenseNumber: "",
};
