"use client";

import { useRouter } from "next/navigation";

import { logoutFn } from "@/shared/api";
import { useAuthStore } from "@/shared/store";

// Logs out on the server (best-effort), clears local auth, returns home.
// Use everywhere instead of calling the store's logout directly so the
// refresh token is always invalidated server-side.
export const useLogout = () => {
  const router = useRouter();

  return async () => {
    const { refreshToken, logout } = useAuthStore.getState();
    if (refreshToken) {
      try {
        await logoutFn(refreshToken);
      } catch {
        // Session is being abandoned regardless — clear locally either way.
      }
    }
    logout();
    router.push("/");
  };
};
