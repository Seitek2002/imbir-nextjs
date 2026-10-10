import { create } from "zustand";
import { StateStorage, createJSONStorage, persist } from "zustand/middleware";

import { toMediaUrl } from "@/shared/lib/media";

export type UserRole = "clinic" | "doctor" | "patient";

// Отдельные от cityStore cookie-имена
export const AUTH_COOKIE = "is_authed";
export const ROLE_COOKIE = "role";

// Ровно столько же, сколько живёт refresh-токен у бэка (проверено: access —
// 60 минут, refresh — 7 дней). Раньше тут было 30 дней, и с 8-го по 30-й день
// cookie утверждала, что пользователь авторизован, хотя оба токена уже
// мертвы: middleware пропускал в кабинет, AuthGuard видел непустую строку
// токена и рендерил его, и только первый запрос ловил 401. Срок куки должен
// умирать вместе с сессией, иначе гейт врёт.
const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 дней — как refresh-токен

// Зеркалим факт авторизации и роль в cookie, чтобы их мог прочитать сервер.
// Время жизни куки (max-age) задаётся только если rememberMe = true.
const writeAuthCookies = (
  token: null | string,
  role: undefined | UserRole,
  rememberMe: boolean = true,
) => {
  if (typeof document === "undefined") return;
  if (!token) {
    document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; samesite=lax`;
    document.cookie = `${ROLE_COOKIE}=; path=/; max-age=0; samesite=lax`;
    return;
  }
  const maxAgeStr = rememberMe ? `; max-age=${AUTH_COOKIE_MAX_AGE}` : "";
  document.cookie = `${AUTH_COOKIE}=1; path=/${maxAgeStr}; samesite=lax`;
  // Роль пишем всегда в паре с is_authed, в том числе пустую. Раньше стояло
  // `if (role)`, а setTokens вызывается раньше setUser — оставалось окно, где
  // is_authed уже 1, а роли ещё нет. Хедер в этот момент не знал, куда вести,
  // и падал в ROUTES.PROFILE, отправляя врача с клиникой в кабинет пациента.
  document.cookie = role
    ? `${ROLE_COOKIE}=${role}; path=/${maxAgeStr}; samesite=lax`
    : `${ROLE_COOKIE}=; path=/; max-age=0; samesite=lax`;
};

const customStateStorage: StateStorage = {
  getItem: (name: string): null | string => {
    if (typeof window === "undefined") return null;
    const local = localStorage.getItem(name);
    if (local) return local;
    return sessionStorage.getItem(name);
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === "undefined") return;
    try {
      const parsed = JSON.parse(value);
      const remember = parsed.state?.rememberMe;
      if (remember) {
        localStorage.setItem(name, value);
        sessionStorage.removeItem(name);
      } else {
        sessionStorage.setItem(name, value);
        localStorage.removeItem(name);
      }
    } catch {
      localStorage.setItem(name, value);
    }
  },
  removeItem: (name: string): void => {
    if (typeof window === "undefined") return;
    localStorage.removeItem(name);
    sessionStorage.removeItem(name);
  },
};

export type AuthUser = {
  avatar?: null | string;
  date_joined: string;
  email: string;
  first_name: string;
  full_name: string;
  id: number;
  last_name: string;
  phone: string;
  role: UserRole;
};

type AuthStore = {
  accessToken: null | string;
  isAuthenticated: () => boolean;
  // Новая вкладка без «Запомнить меня» ждёт, не передаст ли ей сессию
  // соседняя (см. requestSessionHandoff ниже). Пока true, AuthGuard не
  // уводит на /login. В хранилище не пишется.
  isRestoringSession: boolean;
  logout: () => void;
  refreshToken: null | string;
  rememberMe: boolean;
  setAccessToken: (token: string) => void;
  setRememberMe: (remember: boolean) => void;
  setTokens: (tokens: { access: string; refresh: string }) => void;
  setUser: (user: AuthUser) => void;
  user: AuthUser | null;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      rememberMe: false,
      isRestoringSession: false,

      setTokens: ({ access, refresh }) => {
        set({ accessToken: access, refreshToken: refresh });
        writeAuthCookies(access, get().user?.role, get().rememberMe);
      },

      setUser: (user) => {
        // /api/auth/login/ отдаёт avatar относительным ("/media/users/..."),
        // а /api/auth/me/ и /api/profile/ — абсолютным. Из-за этого сразу
        // после входа шапка и сайдбар просили картинку у localhost и ловили
        // 404: аватар появлялся только после захода в «Мои данные».
        // Нормализуем в одной точке — здесь проходят все источники user.
        set({ user: { ...user, avatar: toMediaUrl(user.avatar) ?? null } });
        writeAuthCookies(get().accessToken, user.role, get().rememberMe);
      },

      setAccessToken: (token) => set({ accessToken: token }),

      setRememberMe: (remember) => {
        set({ rememberMe: remember });
        if (get().accessToken) {
          writeAuthCookies(
            get().accessToken,
            get().user?.role ?? undefined,
            remember,
          );
        }
      },

      logout: () => {
        const endedRefresh = get().refreshToken;
        set({ accessToken: null, refreshToken: null, user: null });
        writeAuthCookies(null, undefined);
        // Соседние вкладки с той же сессией тоже выходят: их refresh уже
        // недействителен, а cookie, по которым middleware пускает в кабинет,
        // общие и только что удалены.
        if (endedRefresh)
          postAuthMessage({ type: "logout", refresh: endedRefresh });
      },

      isAuthenticated: () => !!get().accessToken,
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => customStateStorage),
      // Persist tokens, user and rememberMe flag
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        rememberMe: state.rememberMe,
      }),
      // Пустое хранилище — не повод удалять cookie. Без «Запомнить меня»
      // токены лежат в sessionStorage одной вкладки, а is_authed/role общие
      // для всех: раньше любая новая вкладка (sessionStorage в ней пуст)
      // писала сюда null и стирала их, и исходную вкладку, где токен жив,
      // middleware при следующем переходе отправлял на /login. Удаляем cookie
      // только при выходе, при истёкшей сессии (тоже logout) и когда новой
      // вкладке никто не передал сессию (requestSessionHandoff).
      onRehydrateStorage: () => (state) => {
        if (!state?.accessToken) return;
        writeAuthCookies(state.accessToken, state.user?.role, state.rememberMe);
      },
    },
  ),
);

// ── Синхронизация сессии между вкладками ────────────────────────────────────
// Бэк ротирует refresh-токен (каждый refresh выдаёт новый, а старый попадает
// в blacklist), поэтому вкладки с одной сессией обязаны узнавать о новых
// токенах друг друга — иначе вторая вкладка продлевает сессию уже сожжённым
// токеном и её разлогинивает.

type AuthMessage =
  | {
      access: string;
      id: string;
      refresh: string;
      type: "session-offer";
      user: AuthUser | null;
    }
  | { access: string; prevRefresh: string; refresh: string; type: "tokens" }
  | { id: string; type: "session-request" }
  | { refresh: string; type: "logout" };

const AUTH_STORAGE_KEY = "auth-storage";

// Сколько новая вкладка ждёт ответа соседей. Ответ приходит за миллисекунды,
// запас — на загруженный процессор телефона.
const SESSION_HANDOFF_TIMEOUT_MS = 500;

const authChannel: BroadcastChannel | null =
  typeof window !== "undefined" && typeof BroadcastChannel !== "undefined"
    ? new BroadcastChannel("imbir-auth")
    : null;

function postAuthMessage(message: AuthMessage) {
  try {
    authChannel?.postMessage(message);
  } catch {
    // Канал закрыт (вкладка выгружается) — синхронизация не критична.
  }
}

let pendingHandoffId: null | string = null;

authChannel?.addEventListener("message", (event: MessageEvent<AuthMessage>) => {
  const message = event.data;
  const state = useAuthStore.getState();

  switch (message.type) {
    case "tokens":
      // Соседняя вкладка продлила НАШУ сессию — берём новую пару, старый
      // refresh уже в blacklist.
      if (state.refreshToken === message.prevRefresh) {
        useAuthStore.setState({
          accessToken: message.access,
          refreshToken: message.refresh,
        });
      }
      return;
    case "logout":
      if (state.refreshToken === message.refresh) {
        useAuthStore.setState({
          accessToken: null,
          refreshToken: null,
          user: null,
        });
      }
      return;
    case "session-request":
      if (state.accessToken && state.refreshToken) {
        postAuthMessage({
          type: "session-offer",
          id: message.id,
          access: state.accessToken,
          refresh: state.refreshToken,
          user: state.user,
        });
        // Новая вкладка могла успеть стереть cookie старой версией кода —
        // восстанавливаем их от живой сессии.
        writeAuthCookies(state.accessToken, state.user?.role, state.rememberMe);
      }
      return;
    case "session-offer":
      // Принимаем только ответ на свой запрос и только пока своей сессии нет.
      if (message.id !== pendingHandoffId || state.accessToken) return;
      pendingHandoffId = null;
      useAuthStore.setState({
        accessToken: message.access,
        refreshToken: message.refresh,
        user: message.user,
        rememberMe: false,
        isRestoringSession: false,
      });
      writeAuthCookies(message.access, message.user?.role, false);
      return;
  }
});

// Новая вкладка без своей сессии спрашивает соседей. Если никто не ответил,
// живой сессии без «Запомнить меня» нет — cookie остались от закрытой
// вкладки, и их пора убрать, чтобы middleware не пускал в кабинет.
const requestSessionHandoff = () => {
  if (!authChannel) {
    writeAuthCookies(null, undefined);
    return;
  }
  const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  pendingHandoffId = id;
  useAuthStore.setState({ isRestoringSession: true });
  postAuthMessage({ type: "session-request", id });
  window.setTimeout(() => {
    if (pendingHandoffId !== id) return;
    pendingHandoffId = null;
    useAuthStore.setState({ isRestoringSession: false });
    if (!useAuthStore.getState().accessToken) writeAuthCookies(null, undefined);
  }, SESSION_HANDOFF_TIMEOUT_MS);
};

if (typeof window !== "undefined") {
  // Хранилище синхронное, поэтому к этой строке стор уже гидратирован.
  if (!useAuthStore.getState().accessToken) requestSessionHandoff();

  // «Запомнить меня»: сессия лежит в общем localStorage — подтягиваем то,
  // что записала соседняя вкладка (новый refresh после ротации, выход,
  // вход). Вкладку со своей сессией в sessionStorage не трогаем: getItem
  // отдал бы ей чужие данные из localStorage.
  window.addEventListener("storage", (event) => {
    if (event.storageArea !== localStorage || event.key !== AUTH_STORAGE_KEY)
      return;
    if (!event.newValue) return;
    const { accessToken, rememberMe } = useAuthStore.getState();
    if (accessToken && !rememberMe) return;
    void useAuthStore.persist.rehydrate();
  });

  // Пока вкладка была в фоне, другая могла стереть общие cookie (например,
  // старая версия кода или вкладка, не дождавшаяся ответа). Возвращаясь,
  // восстанавливаем их до первого клика, иначе middleware уведёт на /login.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;
    const { accessToken, user, rememberMe } = useAuthStore.getState();
    if (accessToken) writeAuthCookies(accessToken, user?.role, rememberMe);
  });
}

// Перед продлением сессии подтягиваем свежие токены: соседняя вкладка могла
// только что их ротировать. Для localStorage это синхронное чтение; вкладки
// без «Запомнить меня» узнают о ротации через сообщение "tokens".
export const syncAuthFromStorage = () => {
  if (typeof window === "undefined") return;
  if (useAuthStore.getState().rememberMe) void useAuthStore.persist.rehydrate();
};

// Сообщаем соседним вкладкам с той же сессией о новой паре токенов.
export const shareRotatedTokens = (
  prevRefresh: string,
  tokens: { access: string; refresh: string },
) => {
  if (prevRefresh === tokens.refresh) return;
  postAuthMessage({ type: "tokens", prevRefresh, ...tokens });
};
