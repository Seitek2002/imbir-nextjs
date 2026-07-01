"use client";

import { ReactNode, useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { useAuthStore } from "@/shared/store";

// Гейт для защищённых разделов (профиль пациента/врача/клиники): пока стор
// не гидратировался — ничего не рендерим; после гидратации, если токена нет —
// уводим на /login. Иначе разлогиненный пользователь мог открыть кабинет.
export const AuthGuard = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const token = useAuthStore((s) => s.accessToken);
  // Инициализатор useState выполняется и при SSR (Node), где persist-API ещё
  // не готово синхронно — поэтому проверяем гидратацию только в useEffect
  // (гарантированно на клиенте), а не на этапе рендера/инициализации стейта.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    if (hydrated) return;
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }
    return useAuthStore.persist.onFinishHydration(() => setHydrated(true));
  }, [hydrated]);

  useEffect(() => {
    if (hydrated && !token) router.replace("/login");
  }, [hydrated, token, router]);

  if (!hydrated || !token) return null;
  return <>{children}</>;
};
