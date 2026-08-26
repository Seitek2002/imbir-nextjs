import { cookies } from "next/headers";

import type { UserRole } from "@/shared/store";

import type { InitialAuth } from "./initialAuthContext";

// Читает cookie, которые authStore пишет в паре с состоянием стора (см.
// src/shared/store/authStore.ts) — они дают серверный "снимок" авторизации до
// того, как на клиенте отработает гидратация persist-стора. Сам токен сюда не
// попадает — только факт авторизации и роль.
//
// Вызывается ТОЛЬКО в layout'ах защищённых разделов (profile/doctor-profile/
// clinic-profile), а не в корневом layout: cookies() — динамический API, и
// из корня он делал бы динамическим всё дерево, включая /terms, /privacy и
// прочую публичную статику. Публичные страницы поднимают состояние хедера
// клиентской гидратацией (useAuthDisplay), защищённые — получают корректный
// SSR-хедер с первого кадра.
//
// Мобильная (Capacitor) сборка идёт через output: 'export' — статический
// экспорт, где cookies() запрещён (и вообще нет сервера, который читал бы
// запрос: файлы крутятся внутри webview). Флаг NEXT_PUBLIC_BUILD_TARGET —
// build-time константа (NEXT_PUBLIC_* инлайнится литералом при сборке),
// поэтому там ветка ниже даже не доходит до cookies(): Next при пререндере не
// видит вызова динамического API → маршруты остаются статически
// экспортируемыми, а авторизацию целиком поднимает клиент (AuthGuard).
export const readInitialAuth = async (): Promise<InitialAuth> => {
  if (process.env.NEXT_PUBLIC_BUILD_TARGET === "capacitor") {
    return { isAuthed: false };
  }

  const cookieStore = await cookies();
  return {
    isAuthed: cookieStore.get("is_authed")?.value === "1",
    role: cookieStore.get("role")?.value as undefined | UserRole,
  };
};
