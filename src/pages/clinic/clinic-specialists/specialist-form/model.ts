import {
  type AdditionalEducationEntry,
  fromApiAdditionalEducation,
  fromApiEducation,
  fromLegacyAdditionalEducation,
  toApiAdditionalEducation,
  toApiEducation,
} from "@/entities/doctor-education";

import type {
  ClinicDoctorProfile,
  ClinicDoctorProfileBody,
} from "@/shared/api";

// Локальная модель формы «специалист клиники» — поля с макета «Добавить
// специалиста». Все они теперь реально сохраняются: бэк принимает карточку
// врача целиком (POST /api/clinic/doctors/ и PATCH /api/clinic/doctors/{id}/).
export type SpecialistFormState = {
  about: string;
  // Курсы с годом — тот же формат, что в кабинете врача (additional_education).
  additionalEducation: AdditionalEducationEntry[];
  // Специализаций у врача может быть несколько (в кабинете врача — мультивыбор).
  // Раньше форма клиники держала одну и при сохранении стирала остальные.
  additionalSpecialization: string[];
  birthDate: string;
  city: string;
  degree: string;
  diplomaSpecialty: string;
  email: string;
  experienceYears: string;
  fullName: string;
  gender: string;

  graduationYear: string;
  internship: string;
  languages: string;
  licenseNumber: string;
  password: string;
  phone: string;
  photoFile?: File | null;

  photoPreview?: string;
  position: string;
  qualification: string;
  residency: string;
  specialization: string[];
  university: string;

  workplace: string;
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
  specialization: [],
  additionalSpecialization: [],
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
  additionalEducation: [],
  licenseNumber: "",
  about: "",
};

// Макет вводит ФИО одним полем в порядке "Фамилия Имя Отчество" (см. пример
// в макете: "Садыкова Алина Тимуровна"). Отчество бэк отдаёт на чтение
// (ClinicDoctorProfile.patronymic), но при создании врача его принять некуда —
// в ClinicDoctorCreateRequest поля нет. Возвращаем отдельно, чтобы явно
// предупредить, а не потерять молча.
export const splitFullName = (
  fullName: string,
): { droppedPatronymic?: string; firstName: string; lastName: string } => {
  const [lastName = "", firstName = "", ...rest] = fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  // Отчество может быть из нескольких слов («Тимур кызы») — раньше в
  // предупреждение попадало только первое из них.
  const patronymic = rest.join(" ");
  return {
    firstName,
    lastName,
    droppedPatronymic: patronymic || undefined,
  };
};

// "ДД.ММ.ГГГГ" → "ГГГГ-ММ-ДД"; пусто → null (бэк поле обнуляемое)
const toApiDate = (v: string): null | string => {
  const t = v.trim();
  if (!t) return null;
  const m = t.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : t;
};

const fromApiDate = (v: null | string | undefined): string => {
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

// Форма → тело запроса. Специализации приходят названиями (Dropdown работает
// по имени), а бэк принимает только id — резолвит вызывающая сторона и
// передаёт готовые массивы.
// Образование пишем в формате кабинета врача (entities/doctor-education):
// диплом, интернатура и ординатура — отдельными записями, курсы с годом —
// в additional_education. Раньше клиника писала одну запись со своими
// ключами, и врач с пациентом не видели интернатуру и ординатуру, а клиника —
// то, что внёс врач; сохранение любой стороны стирало данные другой.
export const toDoctorProfileBody = (
  d: SpecialistFormState,
  specializationIds: { narrow: number[]; primary: number[] },
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
  education: toApiEducation({
    university: d.university,
    diplomaSpecialty: d.diplomaSpecialty,
    graduationYear: d.graduationYear,
    internship: d.internship,
    residency: d.residency,
    additionalEducation: [],
  }),
  additional_education: toApiAdditionalEducation(d.additionalEducation),
  license_number: d.licenseNumber.trim(),
  about: d.about.trim(),
});

// Только поля, которые клиника реально поменяла. PATCH всей карточки
// перезаписывал всё, что врач успел изменить в своём кабинете, — и даже
// неизменённое образование переписывалось в формат формы.
export const pickChangedFields = (
  next: ClinicDoctorProfileBody,
  prev: ClinicDoctorProfileBody,
): ClinicDoctorProfileBody => {
  const changed = Object.fromEntries(
    Object.entries(next).filter(
      ([key, value]) =>
        value instanceof File ||
        JSON.stringify(value) !==
          JSON.stringify(prev[key as keyof ClinicDoctorProfileBody]),
    ),
  ) as ClinicDoctorProfileBody;
  // Старые курсы врача могли лежать внутри education (см. fromDoctorProfile):
  // новый education их уже не содержит, а пустой additional_education снова
  // показал бы их из education. Поэтому оба поля уходят только вместе.
  if (changed.education || changed.additional_education) {
    changed.education = next.education;
    changed.additional_education = next.additional_education;
  }
  return changed;
};

// Ответ бэка → форма.
export const fromDoctorProfile = (
  p: ClinicDoctorProfile,
): SpecialistFormState => {
  // Читает и формат кабинета врача, и старые записи клиники с ключами
  // internship/residency/diploma_specialization.
  const education = fromApiEducation(p.education);
  const courses = fromApiAdditionalEducation(p.additional_education);

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
    // Телефон у существующего врача только на чтение (меняет сам врач),
    // поэтому храним его целиком, с кодом страны.
    phone: p.phone ?? "",
    email: p.email ?? "",
    photoPreview: p.photo ?? undefined,
    photoFile: null,
    specialization: (p.primary_specializations ?? []).map((s) => s.name),
    additionalSpecialization: (p.narrow_specializations ?? []).map(
      (s) => s.name,
    ),
    experienceYears: p.experience_years ? String(p.experience_years) : "",
    position: p.position ?? "",
    qualification: p.qualification_category ?? "",
    degree: p.academic_degree ?? "",
    university: education.university,
    graduationYear: education.graduationYear,
    internship: education.internship,
    residency: education.residency,
    diplomaSpecialty: education.diplomaSpecialty,
    // Курсы, которые врач завёл до появления additional_education, лежат в
    // education без пометки — их читаем так же, как кабинет врача.
    additionalEducation:
      courses.length > 0 ? courses : fromLegacyAdditionalEducation(p.education),
    licenseNumber: p.license_number ?? "",
    about: p.about ?? "",
  };
};
