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
  institution: string;
  year?: number;
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

const isMarked = (entry: ApiEducationEntry, degree: string) =>
  entry.degree?.trim() === degree;

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
  const list = entries ?? [];
  const internship = list.find((e) => isMarked(e, INTERNSHIP_DEGREE));
  const residency = list.find((e) => isMarked(e, RESIDENCY_DEGREE));
  // Всё, что не помечено — диплом (первая запись) и допобразование (остальные).
  const rest = list.filter(
    (e) => !isMarked(e, INTERNSHIP_DEGREE) && !isMarked(e, RESIDENCY_DEGREE),
  );
  const [diploma, ...additional] = rest;

  return {
    university: diploma?.institution ?? "",
    diplomaSpecialty: diploma?.degree ?? "",
    graduationYear: diploma?.year ? String(diploma.year) : "",
    internship: internship?.institution ?? "",
    residency: residency?.institution ?? "",
    additionalEducation: additional.map((e) => e.institution),
  };
};
