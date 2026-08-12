"use client";

import { useState } from "react";
import { Toaster } from "react-hot-toast";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { AxiosError } from "axios";

import { MobileBottomNav } from "@/widgets/mobile-bottom-nav";

import { CityConfirmBanner } from "@/features/city-confirm";

import { SessionExpiredError } from "@/shared/api";
import { useTapHaptics } from "@/shared/lib/useTapHaptics";

export function Providers({ children }: { children: React.ReactNode }) {
  useTapHaptics();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // Данные будут свежими 1 минуту (не будут лишний раз дергать сервер)
            refetchOnWindowFocus: false, // Отключаем автоматический рефетч при переключении вкладок браузера
            // Ошибки авторизации не повторяем. Дефолтные 3 ретрая React Query
            // здесь только вредят: обновить токен уже пробовал интерсептор
            // (shared/api/client.ts), и каждый ретрай — новый axios-конфиг,
            // то есть ещё один заход в refresh. На странице врача с истёкшей
            // сессией это давало 13 обращений к /api/auth/refresh/ вместо одного.
            retry: (failureCount, error) => {
              if (error instanceof SessionExpiredError) return false;
              const status = (error as AxiosError)?.response?.status;
              if (status === 401 || status === 403) return false;
              return failureCount < 3;
            },
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Глобальная нижняя навигация (моб.) — часть app-wide каркаса, как и
          баннер города/тостер. Живёт здесь, а не в корневом app/layout.tsx,
          чтобы ссылка на виджет была видна внутри src (иначе steiger, сканируя
          только src, считает слайс неиспользуемым). */}
      <MobileBottomNav />
      <CityConfirmBanner />
      <Toaster position="bottom-right" />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
