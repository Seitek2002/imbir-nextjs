// Короткие месяцы для «12 нояб 2025» (как в макете, без точки).
const MONTHS_SHORT = [
  "янв",
  "фев",
  "мар",
  "апр",
  "мая",
  "июн",
  "июл",
  "авг",
  "сен",
  "окт",
  "нояб",
  "дек",
];

// "2025-11-12" → "12 нояб 2025" (мобильная версия карточки).
export const formatDateHuman = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}`;
};

// "2025-11-12" → "12.11.2025" (десктоп-версия карточки).
export const formatDateNumeric = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}.${mm}.${d.getFullYear()}`;
};

// "09:00:00" → "09:00".
export const formatTime = (time: string): string =>
  time?.length >= 5 ? time.slice(0, 5) : time;

// 1700 → "1 700" (неразрывные пробелы-тысячи, как в макете).
export const formatPrice = (price: number): string =>
  price.toLocaleString("ru-RU");
