"use client";

import { FC } from "react";

import { useUserStatus } from "@/shared/lib/useReference";
import { cn } from "@/shared/lib/utils";

// Синий хвост трека — цвет из макета, отдельного токена под него нет.
const NEGATIVE = "#8B9FFF";

type Props = { className?: string };

// Статус пользователя как рецензента: GET /api/references/user-status/{id}/.
// Карточка показывается ВСЕГДА, даже когда бэк отдаёт status: null (сейчас
// это происходит постоянно — справочник AccountStatus на сервере не наполнен).
// В таком случае рисуем ту же вёрстку с нулями: пользователь видит, что блок
// существует и чего в нём ждать, а как только сервер начнёт отдавать статус и
// проценты — они подставятся сюда без правок.
export const UserStatusCard: FC<Props> = ({ className }) => {
  const { status, percent, isLoading } = useUserStatus();

  if (isLoading) return null;

  const hasData = percent !== null;
  const positive = hasData ? Math.round(percent) : 0;
  const negative = hasData ? 100 - positive : 0;

  return (
    <div className={cn("bg-white rounded-3xl p-6", className)}>
      <p className="text-muted text-sm mb-2">Статус пользователя</p>
      <h4 className="text-primary text-2xl font-bold mb-3">
        {status?.name ?? "Пока не присвоен"}
      </h4>
      <p className="text-secondary text-sm leading-relaxed mb-6">
        {status?.description ??
          "Оставляйте отзывы о врачах и клиниках — по их средней оценке мы присвоим вам статус."}
      </p>

      <div className="flex items-center justify-between mb-2">
        <span className="text-muted text-xs">
          Положительных
          <br />
          отзывов
        </span>
        <span className="text-muted text-xs text-right">
          Отрицательных
          <br />
          отзывов
        </span>
      </div>

      {/* Единый трек: оранжевый сегмент + синий хвост, как в макете. Пока
          данных нет, трек остаётся серым, а не «100% отрицательных». */}
      <div className="flex items-center gap-2">
        <span className="text-primary text-sm font-semibold border border-primary rounded-lg px-2 py-0.5">
          {positive}%
        </span>
        <div className="flex-1 h-2 rounded-full overflow-hidden flex bg-border-soft">
          {hasData && (
            <>
              <div
                className="bg-primary h-full"
                style={{ width: `${positive}%` }}
              />
              <div
                className="h-full flex-1"
                style={{ backgroundColor: NEGATIVE }}
              />
            </>
          )}
        </div>
        <span
          className="text-sm font-semibold border rounded-lg px-2 py-0.5"
          style={{ color: NEGATIVE, borderColor: NEGATIVE }}
        >
          {negative}%
        </span>
      </div>
    </div>
  );
};
