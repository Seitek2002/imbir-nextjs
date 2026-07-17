import type { MobileSelectionStage } from "./types";

const MONTHS_GENITIVE = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

const SELECTION_LABELS: Record<
  MobileSelectionStage,
  { title: string; searchPlaceholder: string }
> = {
  clinic: { title: "Выберите клинику", searchPlaceholder: "Поиск клиники" },
  doctor: {
    title: "Выберите специалиста",
    searchPlaceholder: "Поиск специалиста",
  },
  workplace: {
    title: "Выберите место приёма",
    searchPlaceholder: "Поиск клиники",
  },
  service: { title: "Выберите услугу", searchPlaceholder: "Поиск услуги" },
};

export { MONTHS_GENITIVE, SELECTION_LABELS };
