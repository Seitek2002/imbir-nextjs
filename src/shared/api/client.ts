import toast from "react-hot-toast";

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

import { useAuthStore } from "@/shared/store";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://155.212.216.197:8030";
export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
});

// Отдельный таймаут для запросов с файлами. Общие 15 секунд рассчитаны на
// JSON: аватар врача на мобильном интернете в них не укладывается, запрос
// обрывается, и вместе с фото терялись все текстовые поля, которые шли тем же
// PUT — специализации, стаж, образование, опыт работы.
export const FILE_UPLOAD_TIMEOUT_MS = 120_000;

// Attach access token to every request
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Track whether a refresh is already in-flight to prevent loops
let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (value: string) => void;
  reject: (reason: unknown) => void;
}> = [];

const processPendingQueue = (error: unknown, token: string | null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  pendingQueue = [];
};

// Сессию продлить не удалось. Отдельный тип ошибки нужен, чтобы вызывающий код
// НЕ показал пользователю технический текст бэка: раньше сюда прокидывалась
// ошибка самого refresh-эндпоинта, и, например, при отправке отзыва в тосте
// всплывало англоязычное "Token is invalid or expired" вместо человеческого
// объяснения. У этой ошибки нет поля response, поэтому extractErrorMessage
// (см. shared/lib/errors.ts) отдаст фолбэк вызывающего.
export class SessionExpiredError extends Error {
  readonly isSessionExpired = true;

  constructor() {
    super("Сессия истекла");
    this.name = "SessionExpiredError";
  }
}

// Единственное место, где обрабатывается окончательное истечение сессии.
// Раньше здесь был голый logout(): пользователя молча разлогинивало, форма
// отзыва просто исчезала, и никто не объяснял почему. id у тоста
// дедуплицирует сообщение, если 401 прилетел сразу по нескольким запросам.
const handleSessionExpired = () => {
  useAuthStore.getState().logout();
  if (typeof window === "undefined") return;
  toast.error("Сессия истекла. Войдите снова, чтобы продолжить", {
    id: "session-expired",
  });
};

// Auto-refresh on 401
apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    const { refreshToken, setAccessToken } = useAuthStore.getState();

    if (!refreshToken) {
      handleSessionExpired();
      return Promise.reject(new SessionExpiredError());
    }

    if (isRefreshing) {
      // _retry обязателен и здесь. Без него повторённый из очереди запрос,
      // получив 401 второй раз, заходил в интерсептор как «первый» и запускал
      // ЕЩЁ один refresh — на странице с несколькими запросами это давало
      // шторм обращений к /api/auth/refresh/ (воспроизводилось: 10 вызовов).
      originalRequest._retry = true;
      return new Promise<string>((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Голым axios, а не apiClient — иначе запрос попал бы в этот же
      // интерсептор. Таймаут задаём явно: у дефолтного инстанса его нет, и
      // зависший refresh держал бы всю очередь запросов бесконечно.
      const { data } = await axios.post<{ access: string }>(
        `${BASE_URL}/api/auth/refresh/`,
        { refresh: refreshToken },
        { timeout: 15_000 },
      );
      const newToken = data.access;
      setAccessToken(newToken);
      processPendingQueue(null, newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(originalRequest);
    } catch {
      const expired = new SessionExpiredError();
      processPendingQueue(expired, null);
      handleSessionExpired();
      return Promise.reject(expired);
    } finally {
      isRefreshing = false;
    }
  },
);
