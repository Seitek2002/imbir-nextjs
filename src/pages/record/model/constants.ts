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

// emptyText — когда список пуст сам по себе, а не отфильтрован поиском. Это
// разные вещи: «Ничего не найдено» у клиники без врачей читалось как сбой
// поиска, хотя искать там просто нечего.
const SELECTION_LABELS: Record<
  MobileSelectionStage,
  { emptyText: string; searchPlaceholder: string; title: string }
> = {
  clinic: {
    title: "Выберите клинику",
    searchPlaceholder: "Поиск клиники",
    emptyText: "Пока нет ни одной клиники",
  },
  doctor: {
    title: "Выберите специалиста",
    searchPlaceholder: "Поиск специалиста",
    emptyText:
      "У этой клиники пока нет специалистов. Вернитесь назад и выберите другую.",
  },
  workplace: {
    title: "Выберите место приёма",
    searchPlaceholder: "Поиск клиники",
    emptyText: "У врача не указано ни одного места приёма",
  },
  service: {
    title: "Выберите услугу",
    searchPlaceholder: "Поиск услуги",
    emptyText:
      "У этого специалиста пока нет услуг. Вернитесь назад и выберите другого.",
  },
};

export { MONTHS_GENITIVE, SELECTION_LABELS };
