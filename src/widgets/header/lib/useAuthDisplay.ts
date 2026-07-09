"use client";

import { useSyncExternalStore } from "react";

import {
  type InitialAuth,
  useInitialAuth,
} from "@/shared/lib/initialAuthContext";
import { useAuthStore } from "@/shared/store";

// hydrated через useSyncExternalStore с getServerSnapshot=() => false: React
// сам гарантирует, что на рендере, который сверяется с SSR-версткой,
// вернётся false (как и должно быть — сервер про гидратацию стора ничего не
// знает). Это тот же механизм, что "замораживает" token в AuthGuard через
// getInitialState() — здесь он работает НА нас, а не против: обычный
// useState(false)+setState в эффекте не даёт такой гарантии (лечится, но
// ловит "setState синхронно в эффекте" от eslint и требует лишней ручной
// проверки hasHydrated() при монтировании).
const useHydrated = () =>
  useSyncExternalStore(
    (callback) => useAuthStore.persist.onFinishHydration(callback),
    () => useAuthStore.persist.hasHydrated(),
    () => false,
  );

// Даёт хедеру (default-content.tsx, notifications-bell.tsx) значение,
// безопасное для самого первого рендера — до и после гидратации.
//
// В отличие от AuthGuard (где token нужен только внутри эффекта-редиректа
// и его можно смело читать императивно через getState()), здесь isAuthed/
// role идут прямо в разметку (аватар vs "Войти"), поэтому до момента,
// когда hydrated гарантированно true (см. useHydrated выше), используем
// initialAuth из cookie — тот же источник, что и у SSR-разметки, так что
// первый клиентский рендер гарантированно с ней совпадает. После —
// обычный реактивный селектор стора: он уже безопасен и сам
// переподписывается на дальнейшие изменения (логин/логаут).
export const useAuthDisplay = (): InitialAuth => {
  const initialAuth = useInitialAuth();
  const hydrated = useHydrated();

  const accessToken = useAuthStore((s) => s.accessToken);
  const role = useAuthStore((s) => s.user?.role);

  return hydrated ? { isAuthed: !!accessToken, role } : initialAuth;
};
