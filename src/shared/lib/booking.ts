import type { AvailableSlot, DoctorWeekSchedule } from "@/shared/api";

import { todayInBookingZone } from "./datetime";

// Общие хелперы записи на приём — используются и формой /record, и офлайн-
// модалкой на странице врача. Живут в shared, чтобы слайсы не импортировали
// друг у друга (нарушение FSD).

export type TimeSlot = {
  disabled?: boolean;
  value: string;
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

// Длина национальной части зависит от страны (у +996 — 9 цифр, у +7 — 10),
// поэтому её передают явно. По умолчанию — 9, как у Кыргызстана: раньше
// длина была зашита, и номер +7 молча обрезался до 9 цифр.
export const normalizeLocalPhone = (value: string, maxLength = 9) => {
  const digits = value.replace(/\D/g, "").slice(0, maxLength);
  return digits.replace(/(\d{3})(\d{3})?(\d{3})?/, (_, a, b, c) =>
    [a, b, c].filter(Boolean).join(" "),
  );
};

export const isPhoneLocalValid = (local: string, length = 9) =>
  local.replace(/\D/g, "").length === length;

export const isPhoneValid = (value: string, length = 9) =>
  isPhoneLocalValid(value, length);

// Номер для бэка — E.164 без пробелов: "+996" + "700123456".
export const toE164Phone = (dialCode: string, local: string) =>
  `${dialCode}${local.replace(/\D/g, "")}`;

// Полный номер из профиля ("+77011234567", "996 700 123 456") → код страны и
// национальная часть. Код ищем среди известных (dialCodes), самый длинный
// подходящий. Номер без кода и неизвестный код считаем кыргызским, как и
// раньше.
export const splitPhone = (
  full: string,
  dialCodes: string[],
  fallbackDialCode = "+996",
): { dialCode: string; local: string } => {
  const digits = full.replace(/\D/g, "");
  const match = [...dialCodes]
    .sort((a, b) => b.length - a.length)
    .find((code) => {
      const codeDigits = code.replace(/\D/g, "");
      return digits.startsWith(codeDigits) && digits.length > codeDigits.length;
    });
  if (match && (full.trim().startsWith("+") || digits.length > 9)) {
    return {
      dialCode: match,
      local: digits.slice(match.replace(/\D/g, "").length),
    };
  }
  return { dialCode: fallbackDialCode, local: digits };
};

// Записаться можно не дальше, чем на столько дней вперёд: врачи не ведут
// график на годы, а календарь раньше давал выбрать любую дату в будущем.
export const BOOKING_HORIZON_DAYS = 60;

const WEEKDAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
];

// У врача в графике нет ни одного рабочего дня — записаться к нему нельзя.
// Без графика (старый бэк) ничего не знаем — false.
export const hasNoWorkingDays = (schedule?: DoctorWeekSchedule | null) =>
  !!schedule && WEEKDAY_KEYS.every((key) => schedule[key]?.enabled !== true);

// Фильтр дней календаря записи: прошлое (по бишкекскому «сегодня»), даты
// дальше BOOKING_HORIZON_DAYS и выходные врача по его графику. Без графика
// (старый бэк) гасим только прошлое и горизонт.
export const makeBookingDateFilter = (schedule?: DoctorWeekSchedule | null) => {
  const today = todayInBookingZone();
  const lastDay = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate() + BOOKING_HORIZON_DAYS,
  );
  return (date: Date) => {
    if (date < today || date > lastDay) return true;
    if (!schedule) return false;
    return schedule[WEEKDAY_KEYS[date.getDay()]]?.enabled !== true;
  };
};

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
