import {
  type AuthResponse,
  type RegisterDoctorRequest,
  loginFn,
  registerDoctorFn,
} from "@/shared/api";

// Потеря ответа на регистрацию не означает, что аккаунта нет: сервер мог создать
// его и ответить позже клиентского таймаута (15 с) или после обрыва связи. Тогда
// повторная отправка анкеты упирается в «email уже существует», а человек
// остаётся без входа, хотя регистрация состоялась. Поэтому при неопределённом
// исходе пробуем войти теми же данными, что он только что ввёл: вошли — значит
// аккаунт есть, и продолжаем как после обычной регистрации.
type Credentials = { email: string; password: string };

const statusOf = (error: unknown): number | undefined =>
  (error as { response?: { status?: number } } | null)?.response?.status;

// Исход неизвестен, если ответа нет вовсе (таймаут, обрыв, ошибка прокси без
// CORS-заголовков) или сервер ответил 5xx / 400. 400 включён, потому что так
// выглядит повторная отправка после «потерянного» успеха: «email уже занят».
// Остальные коды (401/403/413/429...) — определённый отказ, входить незачем.
export const isAmbiguousRegistrationFailure = (error: unknown): boolean => {
  const status = statusOf(error);
  return status === undefined || status >= 500 || status === 400;
};

// После ответа сервера (400) аккаунт либо уже есть, либо его нет — ждать нечего.
// Без ответа или при 5xx исходный запрос мог ещё выполняться на сервере: даём
// ему несколько секунд закончиться и пробуем вход повторно.
const LOGIN_DELAYS_AFTER_REPLY_MS = [0];
const LOGIN_DELAYS_WITHOUT_REPLY_MS = [0, 4_000];

export const recoverRegistrationByLogin = async (
  credentials: Credentials,
  role: AuthResponse["user"]["role"],
  error: unknown,
): Promise<AuthResponse | null> => {
  if (!credentials.email || !credentials.password) return null;

  const delays =
    statusOf(error) === 400
      ? LOGIN_DELAYS_AFTER_REPLY_MS
      : LOGIN_DELAYS_WITHOUT_REPLY_MS;

  for (const delay of delays) {
    if (delay) await new Promise((resolve) => setTimeout(resolve, delay));
    try {
      const session = await loginFn(credentials);
      // Под этими данными вошёл аккаунт другого типа — это не наша регистрация.
      return session.user.role === role ? session : null;
    } catch {
      // «Неверный email, телефон или пароль»: аккаунта нет (или он ещё не создан).
    }
  }
  return null;
};

export const registerDoctorWithRecovery = async (
  request: RegisterDoctorRequest,
  credentials: Credentials,
): Promise<AuthResponse> => {
  try {
    return await registerDoctorFn(request);
  } catch (error) {
    if (!isAmbiguousRegistrationFailure(error)) throw error;
    const recovered = await recoverRegistrationByLogin(
      credentials,
      "doctor",
      error,
    );
    // Не нашли аккаунт — отдаём исходную ошибку, чтобы страница показала её.
    if (!recovered) throw error;
    return recovered;
  }
};
