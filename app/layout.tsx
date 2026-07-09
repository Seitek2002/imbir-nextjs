import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Onest } from "next/font/google";

import { Providers } from "@/app/providers";

import type { UserRole } from "@/shared/store";
import {
  type InitialAuth,
  InitialAuthProvider,
} from "@/shared/lib/initialAuthContext";

import "@/app/globals.css";

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "IMBIR",
  description: "Онлайн запись на прием к врачам со всего Кыргызстана",
};

// Мобильная (Capacitor) сборка идёт через output: 'export' — статический
// экспорт, где динамические функции вроде cookies() запрещены (и вообще нет
// сервера, который читал бы запрос: файлы крутятся внутри webview). Помечаем
// такую сборку флагом NEXT_PUBLIC_BUILD_TARGET=capacitor.
//
// Флаг — build-time константа (NEXT_PUBLIC_* инлайнится литералом при сборке),
// поэтому в capacitor-сборке ветка ниже даже не доходит до cookies(): Next при
// пререндере не видит вызова динамического API → маршруты остаются статически
// экспортируемыми. Состояние авторизации там полностью поднимает клиентская
// гидратация (AuthGuard + useAuthDisplay, Слой 1) — единственный доступный
// механизм внутри webview и без того. В web-сборке (флаг не задан) cookies()
// вызывается как раньше и даёт корректный SSR-хедер с первого кадра.
const readInitialAuth = async (): Promise<InitialAuth> => {
  if (process.env.NEXT_PUBLIC_BUILD_TARGET === "capacitor") {
    return { isAuthed: false };
  }

  // Читаем cookie, которые authStore пишет в паре с состоянием стора (см.
  // src/shared/store/authStore.ts) — они дают серверный "снимок" авторизации
  // до того, как на клиенте отработает гидратация persist-стора. Сам токен
  // сюда не попадает — только факт авторизации и роль.
  const cookieStore = await cookies();
  return {
    isAuthed: cookieStore.get("is_authed")?.value === "1",
    role: cookieStore.get("role")?.value as UserRole | undefined,
  };
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialAuth = await readInitialAuth();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${onest.className} h-full antialiased`}
    >
      <head suppressHydrationWarning>
        {/* Warm up the connection to the API/media host so the first data and
            image requests don't pay DNS + TLS setup. */}
        <link rel="preconnect" href="https://imbir.sino0on.ru" />
        <link rel="dns-prefetch" href="https://imbir.sino0on.ru" />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-background lg:bg-white"
      >
        <InitialAuthProvider value={initialAuth}>
          <Providers>{children}</Providers>
        </InitialAuthProvider>
      </body>
    </html>
  );
}
