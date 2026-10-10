import toast from "react-hot-toast";

import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

import { loginHref } from "@/shared/config";
import { useAuthStore } from "@/shared/store";
import {
  shareRotatedTokens,
  syncAuthFromStorage,
} from "@/shared/store/authStore";

import type { RefreshResponse } from "./auth/types";

// Экспортируем: серверные компоненты берут тот же адрес, но ходят нативным
// fetch'ем ради кеша Next (axios мимо него проходит) — см. getSiteSettings.
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://155.212.216.197:8030";
const BASE_URL = API_BASE_URL;
export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
});

// Отдельный таймаут для запросов с файлами. Общие 15 секунд рассчитаны на
// JSON: аватар врача на мобильном интернете в них не укладывается, запрос
// обрывается, и вместе с фото терялись все текстовые поля, которые шли тем же
// PUT — специализации, стаж, образование, опыт работы.
export const FILE_UPLOAD_TIMEOUT_MS = 120_000;

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  // Повтор без токена после окончательно истёкшей сессии (см. ниже).
  _anonymousRetry?: boolean;
  _retry?: boolean;
};

// Эндпоинты входа и регистрации токен не используют, но DRF проверяет
// Bearer ещё до прав доступа: с протухшим токеном в сторе вход с верным
// паролем получал 401, интерсептор пытался продлить мёртвую сессию, и форма
// показывала «Неверный email или пароль». Сюда токен не прикрепляем.
// /api/auth/me/ и /api/auth/logout/ сюда не входят — им нужен пользователь.
const ANONYMOUS_AUTH_PATHS = [
  "/api/auth/login/",
  "/api/auth/register/",
  "/api/auth/refresh/",
  "/api/auth/password-reset/",
  "/api/auth/verify/",
  "/api/auth/invite/",
  "/api/auth/email/check/",
];

const isAnonymousAuthRequest = (url?: string) =>
  !!url && ANONYMOUS_AUTH_PATHS.some((path) => url.includes(path));

// Attach access token to every request
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const { _anonymousRetry } = config as RetriableRequestConfig;
  if (_anonymousRetry || isAnonymousAuthRequest(config.url)) return config;
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Track whether a refresh is already in-flight to prevent loops
let isRefreshing = false;
let pendingQueue: Array<{
  reject: (reason: unknown) => void;
  resolve: (value: string) => void;
}> = [];

const processPendingQueue = (error: unknown, token: null | string) => {
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
// Разделы, из которых при истёкшей сессии нужно уходить: смотреть чужой
// кабинет без данных бессмысленно. С публичной страницы (каталог, блог)
// не уводим — там просто перестают работать избранное и запись.
const PROTECTED_PREFIXES = [
  "/profile",
  "/doctor-profile",
  "/clinic-profile",
  "/consultation",
];

const handleSessionExpired = () => {
  useAuthStore.getState().logout();
  if (typeof window === "undefined") return;
  toast.error("Сессия истекла. Войдите снова, чтобы продолжить", {
    id: "session-expired",
  });

  // Раньше редирект случался лишь побочно: logout() чистил стор, AuthGuard
  // это замечал и уводил на /login. Работало только пока гейт смонтирован —
  // то есть зависело от того, на какой странице застал 401. Уводим явно.
  // ?next= возвращает после входа на ту же страницу кабинета.
  const { pathname, search } = window.location;
  const inCabinet = PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  if (inCabinet) {
    const href = loginHref(`${pathname}${search}`);
    window.location.href = `${href}${href.includes("?") ? "&" : "?"}expired=1`;
  }
};

const isSafeMethod = (method?: string) =>
  ["get", "head", "options"].includes((method ?? "get").toLowerCase());

const bearerOf = (config: InternalAxiosRequestConfig): null | string => {
  const header = config.headers?.Authorization;
  return typeof header === "string" && header.startsWith("Bearer ")
    ? header.slice("Bearer ".length)
    : null;
};

// Сессия окончательно мертва. Бэк отвечает 401 даже на публичные
// эндпоинты (списки врачей и клиник, слоты), если прислать протухший Bearer,
// поэтому раньше после неудачного refresh такие запросы падали насовсем:
// React Query их не ретраит, и форма записи с календарём оставались пустыми
// до ручной перезагрузки. Читающие запросы один раз повторяем уже без
// токена — гостю они доступны. Пишущие (запись, отзыв) не повторяем: молча
// создать гостевую запись вместо записи из аккаунта нельзя.
const failWithExpiredSession = (request: RetriableRequestConfig) => {
  const expired = new SessionExpiredError();
  if (request._anonymousRetry || !isSafeMethod(request.method)) {
    return Promise.reject(expired);
  }
  request._retry = true;
  request._anonymousRetry = true;
  request.headers.delete("Authorization");
  return apiClient(request).catch((retryError: unknown) => {
    // Эндпоинт и правда требует входа — отдаём привычную ошибку сессии.
    if ((retryError as AxiosError)?.response?.status === 401) throw expired;
    throw retryError;
  });
};

// Сессия закончилась, только если бэк отверг сам refresh-токен (401 — истёк
// или в blacklist, 400 — битый). Обрыв связи, таймаут и 5xx (например,
// рестарт бэка при деплое, ~12 с) — не повод выкидывать пользователя:
// refresh-токен ещё действителен, следующий запрос его продлит.
const isRefreshRejected = (error: unknown) => {
  if (error instanceof SessionExpiredError) return true;
  const status = (error as AxiosError)?.response?.status;
  return status === 401 || status === 400;
};

const REFRESH_LOCK_NAME = "imbir-auth-refresh";

// Сколько ждём сообщения от соседней вкладки, если наш refresh оказался уже
// использованным (см. refreshAccessToken).
const ROTATION_SETTLE_MS = 300;

// Продление сессии по очереди между вкладками: бэк ротирует refresh-токен,
// и две вкладки, одновременно пришедшие с одним токеном, разлогинивали бы
// одна другую (вторая получает «Token is blacklisted»). Web Locks есть во
// всех актуальных браузерах; без них просто идём без межвкладочной очереди.
const withRefreshLock = async (
  task: () => Promise<string>,
): Promise<string> => {
  if (typeof navigator === "undefined" || !("locks" in navigator)) {
    return task();
  }
  return navigator.locks.request(REFRESH_LOCK_NAME, task);
};

const postRefresh = async (refresh: string): Promise<RefreshResponse> => {
  // Голым axios, а не apiClient — иначе запрос попал бы в этот же
  // интерсептор. Таймаут задаём явно: у дефолтного инстанса его нет, и
  // зависший refresh держал бы всю очередь запросов бесконечно.
  const { data } = await axios.post<RefreshResponse>(
    `${BASE_URL}/api/auth/refresh/`,
    { refresh },
    { timeout: 15_000 },
  );
  return data;
};

// usedAccess — токен, с которым запрос получил 401. Если в сторе уже другой,
// сессию продлили без нас (соседняя вкладка), и второй refresh не нужен.
const refreshAccessToken = (usedAccess: null | string) =>
  withRefreshLock(async () => {
    syncAuthFromStorage();
    const { accessToken, refreshToken } = useAuthStore.getState();
    if (accessToken && accessToken !== usedAccess) return accessToken;
    if (!refreshToken) throw new SessionExpiredError();

    let data: RefreshResponse;
    try {
      data = await postRefresh(refreshToken);
    } catch (error) {
      if (!isRefreshRejected(error)) throw error;
      // Токен могла только что ротировать соседняя вкладка, а сообщение о
      // новой паре ещё в пути. Даём ему дойти и перечитываем стор.
      await new Promise((resolve) => setTimeout(resolve, ROTATION_SETTLE_MS));
      syncAuthFromStorage();
      const latest = useAuthStore.getState();
      if (latest.accessToken && latest.accessToken !== usedAccess) {
        return latest.accessToken;
      }
      throw error;
    }

    // Бэк ротирует refresh (ROTATE_REFRESH_TOKENS): присланный токен уже в
    // blacklist. Раньше сохранялся только access, и следующий refresh через
    // час шёл со старым токеном — сессия жила максимум около двух часов
    // вместо семи дней. Если бэк перестанет ротировать, оставляем прежний.
    const tokens = {
      access: data.access,
      refresh: data.refresh ?? refreshToken,
    };
    // Пока мы ждали ответа, пользователь мог выйти — не воскрешаем сессию.
    if (useAuthStore.getState().refreshToken === refreshToken) {
      useAuthStore.getState().setTokens(tokens);
      shareRotatedTokens(refreshToken, tokens);
    }
    return tokens.access;
  });

// Auto-refresh on 401
apiClient.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    if (
      !originalRequest ||
      error.response?.status !== 401 ||
      originalRequest._retry ||
      // Вход и регистрация шли без токена — продлевать нечего, а 401 тут
      // означает ответ самого эндпоинта, который форма должна показать.
      isAnonymousAuthRequest(originalRequest.url)
    ) {
      return Promise.reject(error);
    }

    const usedAccess = bearerOf(originalRequest);
    const { refreshToken } = useAuthStore.getState();

    if (!refreshToken) {
      handleSessionExpired();
      // Запрос ушёл без токена — повтор без токена ничего не изменит.
      if (!usedAccess) return Promise.reject(new SessionExpiredError());
      return failWithExpiredSession(originalRequest);
    }

    if (isRefreshing) {
      // _retry обязателен и здесь. Без него повторённый из очереди запрос,
      // получив 401 второй раз, заходил в интерсептор как «первый» и запускал
      // ЕЩЁ один refresh — на странице с несколькими запросами это давало
      // шторм обращений к /api/auth/refresh/ (воспроизводилось: 10 вызовов).
      originalRequest._retry = true;
      return new Promise<string>((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then(
        (token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        },
        (queueError: unknown) =>
          queueError instanceof SessionExpiredError
            ? failWithExpiredSession(originalRequest)
            : Promise.reject(queueError),
      );
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const newToken = await refreshAccessToken(usedAccess);
      processPendingQueue(null, newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      if (!isRefreshRejected(refreshError)) {
        // Сеть, таймаут или 5xx: токены не трогаем и никуда не уводим.
        // Запрос падает обычной сетевой ошибкой — React Query повторит его
        // сам, а следующий 401 снова попробует продлить сессию.
        processPendingQueue(refreshError, null);
        return Promise.reject(refreshError);
      }
      const expired = new SessionExpiredError();
      processPendingQueue(expired, null);
      handleSessionExpired();
      return failWithExpiredSession(originalRequest);
    } finally {
      isRefreshing = false;
    }
  },
);
