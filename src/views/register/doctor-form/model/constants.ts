import type { DoctorStep } from "./types";

export const CITIES = [
  { label: "Бишкек", value: "bishkek" },
  { label: "Ош", value: "osh" },
  { label: "Джалал-Абад", value: "jalal-abad" },
  { label: "Каракол", value: "karakol" },
  { label: "Токмок", value: "tokmok" },
  { label: "Нарын", value: "naryn" },
];

export const LANGUAGES = [
  { label: "Кыргызский", value: "kyrgyz" },
  { label: "Русский", value: "russian" },
  { label: "Английский", value: "english" },
];

export const SPECIALIZATIONS = [
  { label: "Терапевт", value: "therapist" },
  { label: "Хирург", value: "surgeon" },
  { label: "Кардиолог", value: "cardiologist" },
  { label: "Невролог", value: "neurologist" },
  { label: "Стоматолог", value: "dentist" },
  { label: "Педиатр", value: "pediatrician" },
  { label: "Гинеколог", value: "gynecologist" },
  { label: "Офтальмолог", value: "ophthalmologist" },
  { label: "Лор", value: "ent" },
  { label: "Дерматолог", value: "dermatologist" },
];

export const STEP_TITLES: Record<DoctorStep, string> = {
  1: "Основная информация",
  2: "Профессиональные данные",
  3: "Образование",
  4: "Сертификаты и документы",
};

export const TOTAL_STEPS = 4;
