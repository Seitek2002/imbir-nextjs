import type { AvailableSlot } from "@/shared/api";

// Общие хелперы записи на приём — используются и формой /record, и офлайн-
// модалкой на странице врача. Живут в shared, чтобы слайсы не импортировали
// друг у друга (нарушение FSD).

export type TimeSlot = {
  value: string;
  disabled?: boolean;
};

// Группа временных слотов (Утро/Обед/Вечер) — доменная форма данных.
export type TimeGroup = {
  label: string;
  slots: TimeSlot[];
};

// API expects an ISO date (YYYY-MM-DD), built from the local calendar day
// so the picked day is never shifted by the timezone offset.
export const toApiDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Picker gives "HH:mm"; API expects "HH:mm:ss".
export const toApiTime = (time: string) =>
  time.length === 5 ? `${time}:00` : time;

export const normalizeLocalPhone = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 9);
  return digits.replace(/(\d{3})(\d{3})?(\d{3})?/, (_, a, b, c) =>
    [a, b, c].filter(Boolean).join(" "),
  );
};

export const isPhoneLocalValid = (local: string) =>
  local.replace(/\s/g, "").length === 9;

export const isPhoneValid = (value: string) => isPhoneLocalValid(value);

export const isEmailValid = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.toLowerCase());

// Реальный API отдаёт плоский список 30-минутных слотов без группировки —
// бьём по тем же границам, что раньше были в хардкоде (Утро/Обед/Вечер).
export const groupAvailableSlots = (slots: AvailableSlot[]): TimeGroup[] => {
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
