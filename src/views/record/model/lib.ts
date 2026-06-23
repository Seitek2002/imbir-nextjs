import { MONTHS_GENITIVE } from "./constants";
import type { SelectionItem } from "./types";

const formatDateLabel = (date: Date) =>
  `${date.getDate()} ${MONTHS_GENITIVE[date.getMonth()]}, ${date.getFullYear()}`;

const formatPrice = (price: number) => `${price} c`;

const normalizeLocalPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 9);
  return digits.replace(/(\d{3})(\d{3})?(\d{3})?/, (_, a, b, c) =>
    [a, b, c].filter(Boolean).join(" "),
  );
};

const isPhoneLocalValid = (local: string) =>
  local.replace(/\s/g, "").length === 9;

const isPhoneValid = (value: string) => {
  return isPhoneLocalValid(value);
};

const isEmailValid = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.toLowerCase());

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
  normalizeLocalPhone,
  isPhoneLocalValid,
  isPhoneValid,
  isEmailValid,
  filterSelectionItems,
};
