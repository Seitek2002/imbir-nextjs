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
export const hasPrice = (value: number | string | null | undefined): boolean =>
  typeof value === "number" ? Number.isFinite(value) : !!value?.trim();
