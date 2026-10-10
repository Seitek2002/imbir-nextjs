// Цена может отсутствовать: бэк отдаёт null, пустую строку или вовсе
// опускает поле. Возвращаем undefined, чтобы UI прятал блок цены, а не
// показывал обманчивое «0 с» (выглядит как «бесплатно»).
export const parsePrice = (value: unknown): number | undefined => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  }
  return undefined;
};

// Цена «есть», если она пришла числом или непустой строкой — 0 считаем
// валидной ценой, а null/undefined/"" — отсутствием данных.
export const hasPrice = (value: null | number | string | undefined): boolean =>
  typeof value === "number" ? Number.isFinite(value) : !!value?.trim();

export const PRICE_INPUT_ERROR = "Стоимость не может быть отрицательной";

// Поле «Стоимость» формы → значение для бэка. Пустое поле — null: так цену и
// очищают (раньше пустое поле не отправлялось, и оставалась старая цена).
// undefined — в поле отрицательное или не число, отправлять нельзя.
export const parsePriceInput = (value: string): null | string | undefined => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed >= 0 ? trimmed : undefined;
};
