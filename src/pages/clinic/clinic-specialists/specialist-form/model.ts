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
  password: string;
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
  password: "",
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

// Макет вводит ФИО одним полем в порядке "Фамилия Имя Отчество" (см. пример
// в макете: "Садыкова Алина Тимуровна"). Бэк при создании врача принимает
// только first_name/last_name (ClinicDoctorCreateRequest) — поля для отчества
// там нет вообще, поэтому третье слово, если оно есть, не с чем сохранить.
// Возвращаем его отдельно, чтобы явно предупредить, а не потерять молча.
export const splitFullName = (
  fullName: string,
): { firstName: string; lastName: string; droppedPatronymic?: string } => {
  const [lastName = "", firstName = "", patronymic] = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return { firstName, lastName, droppedPatronymic: patronymic };
};
