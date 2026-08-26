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
        set({ accessToken: null, refreshToken: null, user: null });
        writeAuthCookies(null, undefined);
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
      onRehydrateStorage: () => (state) => {
        writeAuthCookies(
          state?.accessToken ?? null,
          state?.user?.role,
          state?.rememberMe ?? false,
        );
      },
    },
  ),
);
