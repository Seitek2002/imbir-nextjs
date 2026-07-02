// DRF иногда возвращает ошибки вложенным объектом (например, по шагам формы
// регистрации: { step1: { birth_date: [...] } }), а не плоским списком —
// рекурсивно ищем первую строку, иначе в toast прилетает объект и React
// падает с "Objects are not valid as a React child".
// axios парсит JSON без учёта Content-Type: если бэк на 500 отдаёт HTML
// debug-страницу вместо JSON, парсинг молча падает и err.response.data
// становится сырой HTML-строкой — такую нельзя показывать пользователю.
const isUsableString = (value: string) =>
  value.length <= 300 && !/<\/?[a-z][\s\S]*>/i.test(value);

export const extractErrorMessage = (
  value: unknown,
  fallback = "Что-то пошло не так. Попробуйте снова",
): string => {
  if (typeof value === "string")
    return isUsableString(value) ? value : fallback;
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = extractErrorMessage(item, "");
      if (found) return found;
    }
    return fallback;
  }
  if (value && typeof value === "object") {
    for (const item of Object.values(value)) {
      const found = extractErrorMessage(item, "");
      if (found) return found;
    }
    return fallback;
  }
  return fallback;
};
