import type { DayKey, DayState } from "@/entities/clinic-profile";

// Локальная модель формы процедуры — поля с макета «Добавить/Редактировать
// процедуру». Бэк (ClinicServiceBody) реально принимает только name/category/
// description/price/duration/is_active — остальное (клиника-адрес отдельно от
// профиля, список специалистов, график, слоты записи) в схеме отсутствует,
// поэтому эти поля живут только в браузере до появления нужных ручек.
export type ProcedureFormState = {
  photoPreview?: string;
  name: string;
  category: string;
  price: string;
  currency: string;
  duration: string;
  clinicName: string;
  clinicAddress: string;
  specialistIds: string[];
  schedule: Record<DayKey, DayState>;
  lunchFrom: string;
  lunchTo: string;
};

export const EMPTY_SCHEDULE: Record<DayKey, DayState> = {
  mon: { open: "", close: "", enabled: false },
  tue: { open: "", close: "", enabled: false },
  wed: { open: "", close: "", enabled: false },
  thu: { open: "", close: "", enabled: false },
  fri: { open: "", close: "", enabled: false },
  sat: { open: "", close: "", enabled: false },
  sun: { open: "", close: "", enabled: false },
};

export const EMPTY_PROCEDURE_FORM: ProcedureFormState = {
  photoPreview: undefined,
  name: "",
  category: "",
  price: "",
  currency: "KGS",
  duration: "",
  clinicName: "",
  clinicAddress: "",
  specialistIds: [],
  schedule: EMPTY_SCHEDULE,
  lunchFrom: "",
  lunchTo: "",
};

export const CURRENCY_OPTIONS = [
  { label: "KGS", value: "KGS" },
  { label: "USD", value: "USD" },
];
