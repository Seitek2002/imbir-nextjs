import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// "ДД.ММ.ГГГГ" — маска ввода даты для текстовых полей без date picker'а:
// цифры печатаются, точки-разделители подставляются сами.
export const maskDate = (raw: string): string => {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 4)}.${digits.slice(4)}`;
};

// Рейтинг на карточках — всегда с двумя знаками. Именно так его отдаёт бэк
// ("5.00") и так он выглядел у врача и клиники. У услуг показывалось "2"
// вместо "2.00" — там значение проходило через parseFloat и теряло хвост.
// Принимает и строку: часть карточек получает рейтинг напрямую из ответа,
// где у врача и клиники это строка, а у услуги — число.
export const formatRating = (value: number | string): string =>
  (Number(value) || 0).toFixed(2);

// Русские числительные: 1 год, 2 года, 5 лет. Без этого в интерфейсе
// попадалось «1 отзывов» и «1 лет опыта» — форма слова была прибита
// к множественному числу.
export const plural = (
  count: number,
  one: string,
  few: string,
  many: string,
): string => {
  const tail = Math.abs(count) % 100;
  const last = tail % 10;
  // 11–14 — исключение: у них множественная форма, хотя последняя цифра 1–4.
  if (tail > 10 && tail < 20) return many;
  if (last === 1) return one;
  if (last > 1 && last < 5) return few;
  return many;
};

// Частые случаи, чтобы не повторять формы слова по всему проекту.
export const pluralYears = (n: number) => plural(n, "год", "года", "лет");
export const pluralReviews = (n: number) =>
  plural(n, "отзыв", "отзыва", "отзывов");
