import { ClinicFormData, ClinicStep, DoctorStep } from "./types";

// Наборы по умолчанию для справочников бэка: показываются, пока справочник
// грузится, и дополняют его, если он неполный (см. useReference). На бэк
// уходит выбранная строка как есть — никаких служебных кодов вроде "russian",
// иначе значение не совпадёт ни с одним фильтром и засорит сам справочник.
export const DEFAULT_LANGUAGES = ["Кыргызский", "Русский", "Английский"];

export const STEP_TITLES: Record<DoctorStep, string> = {
  1: "Основная информация",
  2: "Профессиональные данные",
  3: "Образование",
  4: "Сертификаты и документы",
};

export const TOTAL_STEPS = 4;

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

export const DEFAULT_EQUIPMENT = [
  "УЗИ",
  "КТ/МРТ",
  "Операционная",
  "Рентген",
  "Лаборатория",
  "Реанимация",
];

export const DEFAULT_PATIENT_CONDITIONS = [
  "Парковка",
  "Детская зона",
  "Онлайн-консультация",
  "Доступ для инвалидов",
  "Аптека",
];

export const DEFAULT_PAYMENT_METHODS = ["Наличные", "Карта", "Онлайн"];

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
