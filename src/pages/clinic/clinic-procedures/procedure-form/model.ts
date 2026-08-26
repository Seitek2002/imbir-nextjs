import {
  DAY_API,
  type DayKey,
  type DayState,
  toDay,
} from "@/entities/clinic-profile";

import type { ClinicScheduleDay } from "@/shared/api";

// Локальная модель формы процедуры — поля с макета «Добавить/Редактировать
// процедуру». Бэк принимает их все: name/category/description/price/duration/
// is_active/doctor_ids, плюс photo, branch_id (филиал проведения), schedule и
// lunch_break — последние четыре появились после доработки бэка.
export type ProcedureFormState = {
  photoPreview?: string;
  name: string;
  category: string;
  price: string;
  currency: string;
  duration: string;
  branchId: string;
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
  branchId: "",
  specialistIds: [],
  schedule: EMPTY_SCHEDULE,
  lunchFrom: "",
  lunchTo: "",
};

export const CURRENCY_OPTIONS = [
  { label: "KGS", value: "KGS" },
  { label: "USD", value: "USD" },
];

// Форма ↔ бэк: у формы дни это mon/tue/… с open/close, у бэка — monday/tuesday/…
// с from/to (тот же формат, что у графика клиники, см. DAY_API).
export const scheduleToApi = (
  schedule: Record<DayKey, DayState>,
): Record<string, ClinicScheduleDay> =>
  Object.fromEntries(
    (Object.keys(DAY_API) as DayKey[]).map((key) => [
      DAY_API[key],
      {
        enabled: schedule[key].enabled,
        from: schedule[key].open,
        to: schedule[key].close,
      },
    ]),
  );

export const scheduleFromApi = (
  api: Record<string, { from?: string; to?: string; enabled?: boolean }> | null,
): Record<DayKey, DayState> => {
  if (!api) return EMPTY_SCHEDULE;
  return Object.fromEntries(
    (Object.keys(DAY_API) as DayKey[]).map((key) => {
      const day = api[DAY_API[key]];
      return [
        key,
        toDay({ open: day?.from, close: day?.to, enabled: day?.enabled }),
      ];
    }),
  ) as Record<DayKey, DayState>;
};

// Обед отправляем только если заполнены обе границы — половинчатый интервал
// бэк сохранит как есть, и в карточке появится «13:00 – », что читается как
// сломанные данные.
export const lunchToApi = (from: string, to: string) =>
  from.trim() && to.trim() ? { from: from.trim(), to: to.trim() } : null;
