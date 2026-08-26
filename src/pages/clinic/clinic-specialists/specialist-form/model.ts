import type {
  ClinicDoctorCourse,
  ClinicDoctorEducation,
  ClinicDoctorProfile,
  ClinicDoctorProfileBody,
} from "@/shared/api";

// Локальная модель формы «специалист клиники» — поля с макета «Добавить
// специалиста». Все они теперь реально сохраняются: бэк принимает карточку
// врача целиком (POST /api/clinic/doctors/ и PATCH /api/clinic/doctors/{id}/).
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
  photoFile?: File | null;

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
  photoFile: null,
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
// в макете: "Садыкова Алина Тимуровна"). Отчество бэк отдаёт на чтение
// (ClinicDoctorProfile.patronymic), но при создании врача его принять некуда —
// в ClinicDoctorCreateRequest поля нет. Возвращаем отдельно, чтобы явно
// предупредить, а не потерять молча.
export const splitFullName = (
  fullName: string,
): { firstName: string; lastName: string; droppedPatronymic?: string } => {
  const [lastName = "", firstName = "", patronymic] = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  return { firstName, lastName, droppedPatronymic: patronymic };
};

// "ДД.ММ.ГГГГ" → "ГГГГ-ММ-ДД"; пусто → null (бэк поле обнуляемое)
const toApiDate = (v: string): string | null => {
  const t = v.trim();
  if (!t) return null;
  const m = t.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : t;
};

const fromApiDate = (v: string | null | undefined): string => {
  const t = (v ?? "").trim();
  if (!t) return "";
  const m = t.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}.${m[2]}.${m[1]}` : t;
};

const csv = (s: string): string[] =>
  s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

// Образование бэк хранит массивом записей, но на форме это плоские поля —
// кладём всё в одну запись (ВУЗ + год + интернатура + ординатура + диплом).
const toApiEducation = (d: SpecialistFormState): ClinicDoctorEducation[] => {
  const entry: ClinicDoctorEducation = {
    institution: d.university.trim(),
    year: parseInt(d.graduationYear, 10) || null,
    internship: d.internship.trim(),
    residency: d.residency.trim(),
    diploma_specialization: d.diplomaSpecialty.trim(),
  };
  // Пустую запись не шлём — иначе в карточке появится пустой блок образования.
  return Object.values(entry).some(Boolean) ? [entry] : [];
};

// Допобразование — textarea по строке на курс.
const toApiCourses = (value: string): ClinicDoctorCourse[] =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((name) => ({ name }));

// Форма → тело запроса. Специализации приходят названиями (Dropdown работает
// по имени), а бэк принимает только id — резолвит вызывающая сторона и
// передаёт готовые массивы.
export const toDoctorProfileBody = (
  d: SpecialistFormState,
  specializationIds: { primary: number[]; narrow: number[] },
): ClinicDoctorProfileBody => ({
  gender: d.gender || undefined,
  birth_date: toApiDate(d.birthDate),
  city: d.city.trim(),
  languages: csv(d.languages),
  ...(d.photoFile ? { photo: d.photoFile } : {}),
  primary_specialization_ids: specializationIds.primary,
  narrow_specialization_ids: specializationIds.narrow,
  experience_years: parseInt(d.experienceYears, 10) || 0,
  position: d.position.trim(),
  qualification_category: d.qualification.trim(),
  academic_degree: d.degree.trim(),
  education: toApiEducation(d),
  additional_education: toApiCourses(d.additionalEducation),
  license_number: d.licenseNumber.trim(),
});

// Ответ бэка → форма.
export const fromDoctorProfile = (
  p: ClinicDoctorProfile,
): SpecialistFormState => {
  const education = p.education?.[0];

  return {
    ...EMPTY_SPECIALIST_FORM,
    // Макет показывает ФИО одной строкой в порядке «Фамилия Имя Отчество».
    fullName: [p.last_name, p.first_name, p.patronymic]
      .filter(Boolean)
      .join(" "),
    gender: p.gender ?? "",
    birthDate: fromApiDate(p.birth_date),
    city: p.city ?? "",
    languages: Array.isArray(p.languages) ? p.languages.join(", ") : "",
    // PhoneInput работает с национальной частью номера.
    phone: (p.phone ?? "").replace(/^\+?996/, ""),
    email: p.email ?? "",
    photoPreview: p.photo ?? undefined,
    photoFile: null,
    specialization: p.primary_specializations?.[0]?.name ?? "",
    additionalSpecialization: p.narrow_specializations?.[0]?.name ?? "",
    experienceYears: p.experience_years ? String(p.experience_years) : "",
    position: p.position ?? "",
    qualification: p.qualification_category ?? "",
    degree: p.academic_degree ?? "",
    university: education?.institution ?? "",
    graduationYear: education?.year ? String(education.year) : "",
    internship: education?.internship ?? "",
    residency: education?.residency ?? "",
    diplomaSpecialty: education?.diploma_specialization ?? "",
    additionalEducation: (p.additional_education ?? [])
      .map((c) => c.name)
      .filter(Boolean)
      .join("\n"),
    licenseNumber: p.license_number ?? "",
  };
};
