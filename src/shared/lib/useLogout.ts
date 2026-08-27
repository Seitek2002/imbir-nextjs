"use client";

import { useRouter } from "next/navigation";

import { useQueryClient } from "@tanstack/react-query";

import { logoutFn } from "@/shared/api";
import { useAuthStore } from "@/shared/store";

// Logs out on the server (best-effort), clears local auth, returns home.
// Use everywhere instead of calling the store's logout directly so the
// refresh token is always invalidated server-side.
export const useLogout = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return async () => {
    const { refreshToken, logout } = useAuthStore.getState();
    // Профильные ключи общие для всех ролей, поэтому не даём данным текущего
    // пользователя пережить выход и попасть в следующий аккаунт.
    queryClient.clear();
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
