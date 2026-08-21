"use client";

import { FC } from "react";

import { HeartIcon2 } from "@/shared/assets/icons";
import { cn } from "@/shared/lib/utils";

type Props = {
  // Состояние приходит снаружи (из избранного на сервере). Своего состояния
  // кнопка не держит: раньше она переключалась локально и расходилась с тем,
  // что реально сохранено.
  saved?: boolean;
  savedLabel?: string;
  unsavedLabel?: string;
  onSave?: () => void;
};

export const SaveButton: FC<Props> = ({
  saved = false,
  savedLabel = "Убрать из сохранённых",
  unsavedLabel = "Сохранить",
  onSave,
}) => {
  return (
    <button
      type="button"
      onClick={() => onSave?.()}
      aria-label={saved ? savedLabel : unsavedLabel}
      className="transition-transform active:scale-90"
    >
      <HeartIcon2
        className={cn(
          // Размер обязателен: в heart-2.svg нет width/height (только viewBox),
          // поэтому без класса svg внутри shrink-to-fit кнопки схлопывался в
          // 0×0 — сердечко на карточках врача и клиники было не видно и не
          // нажать (проверено getBoundingClientRect на /specialists).
          "size-6 transition-colors",
          saved && "[&_path]:fill-[#FFA18D] [&_path]:stroke-[#FFA18D]",
        )}
      />
    </button>
  );
};
