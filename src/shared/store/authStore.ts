import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "patient" | "doctor" | "clinic";

// Отдельные от cityStore cookie-имена (city/imbir-city-set/imbir-detected-city
// принадлежат другому независимому механизму — см. middleware.ts) — middleware
// их не читает и не пишет, коллизий по неймингу/инфраструктуре нет.
export const AUTH_COOKIE = "is_authed";
export const ROLE_COOKIE = "role";

const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 дней

// Зеркалим факт авторизации и роль в cookie, чтобы их мог прочитать сервер
// (middleware/SSR — localStorage там недоступен). Сам токен в cookie не
// попадает: как и раньше, он живёт только в сторе и уходит в Authorization:
// Bearer из apiClient.
const writeAuthCookies = (token: string | null, role: UserRole | undefined) => {
  if (typeof document === "undefined") return;
  if (!token) {
    document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; samesite=lax`;
    document.cookie = `${ROLE_COOKIE}=; path=/; max-age=0; samesite=lax`;
    return;
  }
  document.cookie = `${AUTH_COOKIE}=1; path=/; max-age=${AUTH_COOKIE_MAX_AGE}; samesite=lax`;
  if (role) {
    document.cookie = `${ROLE_COOKIE}=${role}; path=/; max-age=${AUTH_COOKIE_MAX_AGE}; samesite=lax`;
  }
};

export type AuthUser = {
  id: number;
  role: UserRole;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  date_joined: string;
  avatar?: string | null;
};

type AuthStore = {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  setTokens: (tokens: { access: string; refresh: string }) => void;
  setUser: (user: AuthUser) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,

      setTokens: ({ access, refresh }) => {
        set({ accessToken: access, refreshToken: refresh });
        writeAuthCookies(access, get().user?.role);
      },

      setUser: (user) => {
        set({ user });
        writeAuthCookies(get().accessToken, user.role);
      },

      setAccessToken: (token) => set({ accessToken: token }),

      logout: () => {
        set({ accessToken: null, refreshToken: null, user: null });
        writeAuthCookies(null, undefined);
      },

      isAuthenticated: () => !!get().accessToken,
    }),
    {
      name: "auth-storage",
      // Only persist tokens and user — nothing else
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
      // Синхронизируем cookie с восстановленным из localStorage состоянием —
      // тот же паттерн, что и в cityStore: cookie должна отражать сторовое
      // состояние сразу после гидратации, а не только на новых логинах.
      onRehydrateStorage: () => (state) => {
        writeAuthCookies(state?.accessToken ?? null, state?.user?.role);
      },
    },
  ),
);
