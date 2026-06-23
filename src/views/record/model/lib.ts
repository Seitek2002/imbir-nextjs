import { MONTHS_GENITIVE } from "./constants";

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

export {
  formatDateLabel,
  formatPrice,
  normalizeLocalPhone,
  isPhoneLocalValid,
  isPhoneValid,
  isEmailValid,
};
