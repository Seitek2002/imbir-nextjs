"use client";

import { useEffect } from "react";

import Link from "next/link";

import { WarningIcon } from "@/shared/assets/icons";
import { Button } from "@/shared/ui";

// Корневой error boundary — намеренно не зависит от Header/Footer и
// стора города/авторизации: если сбой произошёл именно в одном из них,
// повторный рендер тех же виджетов здесь мог бы просто уронить страницу
// ещё раз.
export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-border p-8 flex flex-col items-center text-center gap-4">
        <span className="text-2xl font-bold text-primary">IMBIR</span>

        <div className="size-16 rounded-full bg-red-50 flex items-center justify-center">
          <WarningIcon className="size-8" />
        </div>

        <div>
          <h1 className="text-xl font-semibold text-foreground mb-2">
            Что-то пошло не так
          </h1>
          <p className="text-secondary text-sm">
            Произошла непредвиденная ошибка. Попробуйте обновить страницу — если
            это повторится, напишите нам в поддержку.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
          <Button
            variant="outline"
            size="md"
            className="flex-1 justify-center"
            // Здесь был reset() из Next — он просто перерисовывает то же самое
            // поддерево тем же кодом и с тем же кэшем. Если ошибка не разовая
            // (а она почти всегда не разовая), рендер падает снова и экран не
            // меняется — кнопка выглядит мёртвой. Полная перезагрузка сбрасывает
            // и состояние клиента, и кэш роутера, поэтому шанс уйти с экрана реальный.
            onClick={() => window.location.reload()}
          >
            Попробовать снова
          </Button>
          <Link href="/" className="flex-1">
            <Button size="md" className="w-full justify-center">
              На главную
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
