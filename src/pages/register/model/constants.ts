import { ClinicFormData, ClinicStep, DoctorStep } from "./types";

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

export const CLINIC_TYPES = [
  { label: "Частная", value: "private" },
  { label: "Государственная", value: "public" },
  { label: "Многопрофильная", value: "multi" },
  { label: "Специализированная", value: "specialized" },
];

export const COUNTRIES = [
  { label: "Кыргызстан", value: "kg" },
  { label: "Казахстан", value: "kz" },
  { label: "Россия", value: "ru" },
];

export const DAYS: { key: keyof ClinicFormData["schedule"]; label: string }[] =
  [
    { key: "mon", label: "ПН" },
    { key: "tue", label: "ВТ" },
    { key: "wed", label: "СР" },
    { key: "thu", label: "ЧТ" },
    { key: "fri", label: "ПТ" },
    { key: "sat", label: "СБ" },
    { key: "sun", label: "ВС" },
  ];

export const EQUIPMENT_OPTIONS = [
  "УЗИ",
  "КТ/МРТ",
  "Операционная",
  "Рентген",
  "Лаборатория",
  "Реанимация",
];

export const PATIENT_CONDITIONS = [
  "Парковка",
  "Детская зона",
  "Онлайн-консультация",
  "Доступ для инвалидов",
  "Аптека",
];

export const PAYMENT_OPTIONS = ["Наличные", "Карта", "Онлайн"];

export const CLINIC_STEP_TITLES: Record<ClinicStep, string> = {
  1: "Основная информация",
  2: "Локация и контакты",
  3: "График работы",
  4: "Юридическая информация",
  5: "Специализация и услуги",
  6: "Оборудование и условия",
  7: "Завершение регистрации",
};

export const CLINIC_TOTAL_STEPS = 7;

export const maskDate = (raw: string): string => {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
};
