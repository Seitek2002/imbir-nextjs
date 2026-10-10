"use client";

import { FC } from "react";

import { useUserStatus } from "@/shared/lib/useReference";
import { cn } from "@/shared/lib/utils";

// Синий хвост трека — цвет из макета, отдельного токена под него нет.
const NEGATIVE = "#8B9FFF";

type Props = { className?: string };

// Статус пользователя как рецензента: GET /api/references/user-status/{id}/.
// Карточка показывается ВСЕГДА, в том числе когда бэк отдаёт status: null —
// так бывает у пользователя без отзывов. В этом случае рисуем ту же вёрстку с
// нулями: человек видит, что блок существует и чего в нём ждать.
// Статус сервер выбирает по средней оценке отзывов, а доли «положительных» и
// «отрицательных» считает по самим отзывам (4–5★ и 1–2★, 3★ — нейтральные,
// поэтому сумма может быть меньше 100). После любого изменения отзыва кэш
// сбрасывается — см. useInvalidateUserStatus.
export const UserStatusCard: FC<Props> = ({ className }) => {
  const { status, percent, positivePercent, negativePercent, isLoading } =
    useUserStatus();

  if (isLoading) return null;

  const hasData = percent !== null;
  // Старый бэк долей не отдаёт — тогда остаётся прежний расчёт от среднего балла.
  const hasShares = positivePercent !== null && negativePercent !== null;
  const positive = hasShares
    ? Math.round(positivePercent)
    : hasData
      ? Math.round(percent)
      : 0;
  // Обе доли округляются вверх на .5 (12.5 + 87.5 → 13 + 88), поэтому
  // отрицательную ограничиваем остатком, чтобы сумма не вылезала за 100.
  const negative = hasShares
    ? Math.min(Math.round(negativePercent), 100 - positive)
    : hasData
      ? 100 - positive
      : 0;

  return (
    <div
      className={cn("bg-white rounded-3xl border border-border p-6", className)}
    >
      <p className="text-muted text-sm mb-2">Статус пользователя</p>
      <h4 className="text-primary text-2xl font-bold mb-3">
        {status?.name ?? "Пока не присвоен"}
      </h4>
      <p className="text-secondary text-sm leading-relaxed mb-6">
        {status?.description ??
          "Оставляйте отзывы о врачах и клиниках — по их средней оценке мы присвоим вам статус."}
      </p>

      {/* Подписи, чипы и трек — в отдельной светлой подложке, как в макете. */}
      <div className="bg-background rounded-2xl p-4">
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

        {/* Единый трек: оранжевый сегмент слева, синий справа, как в макете;
          нейтральные отзывы — серый промежуток между ними. Пока данных нет,
          трек остаётся серым, а не «100% отрицательных». */}
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
                  className="h-full ml-auto"
                  style={{ backgroundColor: NEGATIVE, width: `${negative}%` }}
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
    </div>
  );
};
