// Общие хелперы записи вынесены в shared (их использует и офлайн-модалка на
// странице врача — слайсам нельзя импортировать друг у друга). Реэкспортим,
// чтобы внутренние импорты record из "./lib" остались без изменений.
import {
  groupAvailableSlots,
  isEmailValid,
  isPhoneLocalValid,
  isPhoneValid,
  normalizeLocalPhone,
  toApiDate,
  toApiTime,
} from "@/shared/lib/booking";

import { MONTHS_GENITIVE } from "./constants";
import type { SelectionItem } from "./types";

const formatDateLabel = (date: Date) =>
  `${date.getDate()} ${MONTHS_GENITIVE[date.getMonth()]}, ${date.getFullYear()}`;

// Цены нет (клиника её не указала) — так и пишем, а не «0 c»: ноль читается
// как «бесплатно».
const formatPrice = (price: number | undefined) =>
  price === undefined ? "Цена уточняется" : `${price} c`;

const filterSelectionItems = (items: SelectionItem[], query: string) => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return items;

  return items.filter((item) => {
    if ("title" in item) {
      return (
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.category.toLowerCase().includes(normalizedQuery)
      );
    }

    if ("specialty" in item) {
      return (
        item.name.toLowerCase().includes(normalizedQuery) ||
        item.specialty.toLowerCase().includes(normalizedQuery)
      );
    }

    return (
      item.name.toLowerCase().includes(normalizedQuery) ||
      item.address.toLowerCase().includes(normalizedQuery)
    );
  });
};

export {
  formatDateLabel,
  formatPrice,
  toApiDate,
  toApiTime,
  normalizeLocalPhone,
  isPhoneLocalValid,
  isPhoneValid,
  isEmailValid,
  filterSelectionItems,
  groupAvailableSlots,
};
