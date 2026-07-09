"use client";

import { ReactNode, useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { useAuthStore } from "@/shared/store";

// Гейт для защищённых разделов (профиль пациента/врача/клиники): пока стор
// не гидратировался — ничего не рендерим; после гидратации, если токена нет —
// уводим на /login. Иначе разлогиненный пользователь мог открыть кабинет.
//
// ВАЖНО про token и useSyncExternalStore (zustand v5, react.mjs):
// useAuthStore(selector) реализован через
// React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot), где
// getServerSnapshot = () => selector(api.getInitialState()). getInitialState()
// — это state, зафиксированный ОДИН РАЗ в момент создания стора (см.
// zustand/vanilla: initialState = state = createState(...)), он больше
// никогда не обновляется, в отличие от getState(). React обязан использовать
// getServerSnapshot на первом клиентском рендере после SSR (чтобы не словить
// hydration mismatch), поэтому реактивный `token` на этом первом рендере
// всегда "замороженный" initial (accessToken: null), даже если сам стор к
// этому моменту уже реально гидратировался. Из-за этого `hydrated` (не
// завязан на useSyncExternalStore, читается напрямую через persist API) мог
// стать true раньше, чем реактивный token — что приводило к ложному редиректу
// залогиненного пользователя. persist.hydrate() вызывает set(...) (обновляет
// getState()) ДО того как выставить hasHydrated = true (см.
// zustand/middleware persist.mjs), поэтому getState() на момент эффекта уже
// содержит актуальный токен — читаем его императивно, а не из реактивного
// селектора.
export const AuthGuard = ({ children }: { children: ReactNode }) => {
  const router = useRouter();
  const token = useAuthStore((s) => s.accessToken);
  // Ленивый инициализатор: если persist уже гидратировался к моменту монтирования
  // (частый случай — стор мог гидратироваться раньше через другой компонент,
  // например Header), читаем это синхронно и не ждём лишний тик. На SSR
  // window undefined — там всегда false.
  const [hydrated, setHydrated] = useState(
    () => typeof window !== "undefined" && useAuthStore.persist.hasHydrated(),
  );

  // Фолбэк на случай, если к моменту монтирования гидратация ещё не завершилась —
  // подписываемся на её окончание.
  useEffect(() => {
    if (hydrated) return;
    return useAuthStore.persist.onFinishHydration(() => setHydrated(true));
  }, [hydrated]);

  useEffect(() => {
    // Условие проверяем по getState() (см. комментарий выше), а не по
    // замыканию `token` — но `token` всё равно держим в зависимостях, чтобы
    // эффект перезапускался при реальном изменении стора (например, логаут
    // с уже открытой защищённой страницы, без перезагрузки) — иначе рендер
    // корректно скроет детей по гейту ниже, но редиректа не произойдёт.
    if (hydrated && !useAuthStore.getState().accessToken) {
      router.replace("/login");
    }
  }, [hydrated, token, router]);

  if (!hydrated || !token) return null;
  return <>{children}</>;
};
