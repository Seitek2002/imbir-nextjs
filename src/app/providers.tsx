"use client";

import { Suspense, useState } from "react";
import { Toaster } from "react-hot-toast";

import dynamic from "next/dynamic";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import type { AxiosError } from "axios";

import { MobileBottomNav } from "@/widgets/mobile-bottom-nav";

import { ChatMessageSoundWatcher } from "@/features/chat-notifications";
import { CityConfirmBanner } from "@/features/city-confirm";

import { SessionExpiredError } from "@/shared/api";
import { UrlStateBridge } from "@/shared/lib/url-state";
import {
  usePendingClinicAppointments,
  usePendingDoctorAppointments,
} from "@/shared/lib/usePendingAppointments";
import { useTapHaptics } from "@/shared/lib/useTapHaptics";
import { useAuthStore, useCityStore } from "@/shared/store";

// Модалка выбора города тянет за собой Modal и Dropdown со всеми их
// зависимостями, а открывают её редко, поэтому грузим её отдельным чанком
// при первом открытии.
const CitySelectorModal = dynamic(
  () =>
    import("@/widgets/header/ui/city-selector").then(
      (mod) => mod.CitySelectorModal,
    ),
  { ssr: false },
);

// Одно окно выбора города на всё приложение. Открывается через cityStore:
// кнопкой города в шапке и «Изменить» в баннере подтверждения города.
function CitySelectorHost() {
  const isOpen = useCityStore((s) => s.selectorOpen);
  const close = useCityStore((s) => s.closeSelector);
  // Монтируем модалку только после первого открытия (до этого её чанк даже
  // не запрашивается) и дальше уже не размонтируем — она сама решает, что
  // показывать, по isOpen. Флаг ставим прямо в рендере (паттерн «adjust
  // state during render»), а не в эффекте.
  const [requested, setRequested] = useState(false);
  if (isOpen && !requested) setRequested(true);

  if (!requested) return null;
  return <CitySelectorModal isOpen={isOpen} onClose={close} />;
}

// Звук «Новые записи» для врача и клиники на любой странице, а не только в
// кабинете: раньше опрос жил лишь в сайдбаре/меню кабинета, и на /chat или
// публичном сайте новая запись приходила молча. Ничего не рисует; бейджи в
// кабинете читают тот же кеш react-query.
function PendingAppointmentsWatcher() {
  const isAuthed = useAuthStore((s) => Boolean(s.accessToken));
  const role = useAuthStore((s) => s.user?.role);

  usePendingDoctorAppointments({
    enabled: isAuthed && role === "doctor",
    sound: true,
  });
  usePendingClinicAppointments({
    enabled: isAuthed && role === "clinic",
    sound: true,
  });

  return null;
}

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
      {/* Свой Suspense обязателен — см. комментарий к UrlStateBridge. */}
      <Suspense fallback={null}>
        <UrlStateBridge />
      </Suspense>
      <CityConfirmBanner />
      <ChatMessageSoundWatcher />
      <PendingAppointmentsWatcher />
      <CitySelectorHost />
      <Toaster position="bottom-right" />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
