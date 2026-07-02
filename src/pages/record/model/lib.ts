import type { AvailableSlot } from "@/shared/api";

import type { TimeGroup } from "../ui/appointment-datetime-picker";
import { MONTHS_GENITIVE } from "./constants";
import type { SelectionItem } from "./types";

const formatDateLabel = (date: Date) =>
  `${date.getDate()} ${MONTHS_GENITIVE[date.getMonth()]}, ${date.getFullYear()}`;

const formatPrice = (price: number) => `${price} c`;

// API expects an ISO date (YYYY-MM-DD), built from the local calendar day
// so the picked day is never shifted by the timezone offset.
const toApiDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Picker gives "HH:mm"; API expects "HH:mm:ss".
const toApiTime = (time: string) => (time.length === 5 ? `${time}:00` : time);

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

// Реальный API отдаёт плоский список 30-минутных слотов без группировки —
// бьём по тем же границам, что раньше были в хардкоде (Утро/Обед/Вечер).
const groupAvailableSlots = (slots: AvailableSlot[]): TimeGroup[] => {
  const groups: { label: string; slots: AvailableSlot[] }[] = [
    { label: "Утро", slots: [] },
    { label: "Обед", slots: [] },
    { label: "Вечер", slots: [] },
  ];

  for (const slot of slots) {
    const hour = Number(slot.time.slice(0, 2));
    const group = hour < 13 ? groups[0] : hour < 18 ? groups[1] : groups[2];
    group.slots.push(slot);
  }

  return groups
    .filter((group) => group.slots.length > 0)
    .map((group) => ({
      label: group.label,
      slots: group.slots.map((slot) => ({
        value: slot.time,
        disabled: !slot.available,
      })),
    }));
};

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
