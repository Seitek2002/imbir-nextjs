"use client";

import { useState } from "react";
import { Toaster } from "react-hot-toast";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

import { MobileBottomNav } from "@/widgets/mobile-bottom-nav";

import { CityConfirmBanner } from "@/features/city-confirm";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // Данные будут свежими 1 минуту (не будут лишний раз дергать сервер)
            refetchOnWindowFocus: false, // Отключаем автоматический рефетч при переключении вкладок браузера
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
