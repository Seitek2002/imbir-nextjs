import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "patient" | "doctor" | "clinic";

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

      setTokens: ({ access, refresh }) =>
        set({ accessToken: access, refreshToken: refresh }),

      setUser: (user) => set({ user }),

      setAccessToken: (token) => set({ accessToken: token }),

      logout: () => set({ accessToken: null, refreshToken: null, user: null }),

      isAuthenticated: () => !!get().accessToken,
    }),
    {
      name: "auth-storage",
      // skipHydration prevents SSR/client hydration mismatch in Next.js.
      // Rehydration is triggered manually in StoreHydration component.
      skipHydration: true,
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
      }),
    },
  ),
);
