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

// Потеря ответа не доказывает, что сервер не создал аккаунт. Не предлагаем
// слепо повторять POST: сначала пользователь может проверить вход.
export const getRegistrationErrorMessage = (error: unknown): string => {
  const failure = error as {
    code?: string;
    response?: { data?: unknown; status?: number };
  } | null;
  const checkLogin =
    "Аккаунт мог быть создан: сначала попробуйте войти. Если аккаунта нет — повторите регистрацию.";

  if (failure?.code === "ECONNABORTED" || failure?.code === "ETIMEDOUT") {
    return `Истекло время ожидания ответа. ${checkLogin}`;
  }
  if (!failure?.response) {
    return `Прервано соединение с сервером. Проверьте интернет. ${checkLogin}`;
  }
  // На 5xx иногда приходит HTML от nginx/Django вместо ответа API.
  if ((failure.response.status ?? 0) >= 500)
    return `Сервер не подтвердил регистрацию. ${checkLogin}`;
  const message = extractErrorMessage(failure.response.data, "").trim();
  return (
    message ||
    `Сервер не подтвердил регистрацию. Проверьте связь. ${checkLogin}`
  );
};
