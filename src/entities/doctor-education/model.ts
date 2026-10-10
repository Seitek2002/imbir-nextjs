// Образование врача бэк хранит одним свободным массивом: в схеме
// DoctorOwnProfileRequest поле education объявлено как nullable без структуры,
// и отдельных полей под интернатуру с ординатурой там нет. Поэтому кладём их
// теми же записями, помечая degree — его значение и служит признаком, по
// которому запись читается обратно. До этого интернатура и ординатура были
// декоративными: врач их вводил и в анкете, и в кабинете, а при сохранении они
// отбрасывались и всегда показывались пустыми.

export const INTERNSHIP_DEGREE = "Интернатура";
export const RESIDENCY_DEGREE = "Ординатура";

export type ApiEducationEntry = {
  degree?: string;
  // Старый формат кабинета клиники: одна запись, где интернатура, ординатура
  // и специальность по диплому лежали отдельными ключами. Читаем его тем же
  // путём (см. expandLegacyClinicEntry), пишем всегда формат кабинета врача.
  diploma_specialization?: string;
  institution: string;
  internship?: string;
  residency?: string;
  year?: null | number;
};

export type AdditionalEducationEntry = { name: string; year: string };
export type ApiAdditionalEducationEntry = {
  name?: string;
  year?: null | number;
};

export const toApiAdditionalEducation = (
  entries: AdditionalEducationEntry[],
): { name: string; year: null | number }[] =>
  entries
    .map(({ name, year }) => ({
      name: name.trim(),
      year: parseInt(year, 10) || null,
    }))
    .filter(({ name }) => Boolean(name));

export const fromApiAdditionalEducation = (
  entries: ApiAdditionalEducationEntry[] | null | undefined,
): AdditionalEducationEntry[] =>
  (entries ?? [])
    .filter((entry) => Boolean(entry.name?.trim()))
    .map((entry) => ({
      name: entry.name!.trim(),
      year: entry.year ? String(entry.year) : "",
    }));

const isMarked = (entry: ApiEducationEntry, degree: string) =>
  entry.degree?.trim() === degree;

// Запись клиники {institution, year, internship, residency,
// diploma_specialization} → записи формата кабинета врача: диплом
// (специальность в degree) + помеченные интернатура и ординатура. Без этого
// ни врач, ни пациент не видели интернатуру, внесённую клиникой, а первое же
// сохранение кабинета врачом её стирало.
const expandLegacyClinicEntry = (
  entry: ApiEducationEntry,
): ApiEducationEntry[] => {
  const internship = entry.internship?.trim() ?? "";
  const residency = entry.residency?.trim() ?? "";
  const diplomaSpecialty = entry.diploma_specialization?.trim() ?? "";
  if (!internship && !residency && !diplomaSpecialty) return [entry];

  const expanded: ApiEducationEntry[] = [];
  if (entry.institution?.trim() || diplomaSpecialty) {
    expanded.push({
      institution: entry.institution ?? "",
      degree: entry.degree?.trim() || diplomaSpecialty,
      year: entry.year ?? 0,
    });
  }
  if (internship) {
    expanded.push({ institution: internship, degree: INTERNSHIP_DEGREE });
  }
  if (residency) {
    expanded.push({ institution: residency, degree: RESIDENCY_DEGREE });
  }
  return expanded;
};

const normalizeEducation = (
  entries: ApiEducationEntry[] | null | undefined,
): ApiEducationEntry[] =>
  (entries ?? []).flatMap((entry) =>
    entry && typeof entry === "object" ? expandLegacyClinicEntry(entry) : [],
  );

export const fromLegacyAdditionalEducation = (
  entries: ApiEducationEntry[] | null | undefined,
): AdditionalEducationEntry[] => {
  const rest = normalizeEducation(entries).filter(
    (entry) =>
      !isMarked(entry, INTERNSHIP_DEGREE) && !isMarked(entry, RESIDENCY_DEGREE),
  );
  return rest.slice(1).map((entry) => ({
    name: entry.institution,
    year: entry.year ? String(entry.year) : "",
  }));
};

export type EducationForm = {
  additionalEducation: string[];
  diplomaSpecialty: string;
  graduationYear: string;
  internship: string;
  residency: string;
  university: string;
};

export const EMPTY_EDUCATION_FORM: EducationForm = {
  university: "",
  diplomaSpecialty: "",
  graduationYear: "",
  internship: "",
  residency: "",
  additionalEducation: [],
};

export const toApiEducation = (form: EducationForm): ApiEducationEntry[] => {
  const entries: ApiEducationEntry[] = [];

  // Диплом идёт первым: чтение опирается на этот порядок.
  if (form.university.trim()) {
    entries.push({
      institution: form.university.trim(),
      degree: form.diplomaSpecialty.trim(),
      year: parseInt(form.graduationYear, 10) || 0,
    });
  }
  if (form.internship.trim()) {
    entries.push({
      institution: form.internship.trim(),
      degree: INTERNSHIP_DEGREE,
      year: 0,
    });
  }
  if (form.residency.trim()) {
    entries.push({
      institution: form.residency.trim(),
      degree: RESIDENCY_DEGREE,
      year: 0,
    });
  }
  form.additionalEducation
    .map((item) => item.trim())
    .filter(Boolean)
    .forEach((institution) =>
      entries.push({ institution, degree: "", year: 0 }),
    );

  return entries;
};

export const fromApiEducation = (
  entries: ApiEducationEntry[] | null | undefined,
): EducationForm => {
  const list = normalizeEducation(entries);
  const internship = list.find((e) => isMarked(e, INTERNSHIP_DEGREE));
  const residency = list.find((e) => isMarked(e, RESIDENCY_DEGREE));
  // Всё, что не помечено — диплом (первая запись) и допобразование (остальные).
  const rest = list.filter(
    (e) => !isMarked(e, INTERNSHIP_DEGREE) && !isMarked(e, RESIDENCY_DEGREE),
  );
  const [diploma] = rest;

  return {
    university: diploma?.institution ?? "",
    diplomaSpecialty: diploma?.degree ?? "",
    graduationYear: diploma?.year ? String(diploma.year) : "",
    internship: internship?.institution ?? "",
    residency: residency?.institution ?? "",
    additionalEducation: fromLegacyAdditionalEducation(list).map((e) => e.name),
  };
};
