"use client";

import { FC } from "react";

import { HeartIcon } from "@/shared/assets/icons";
import { cn } from "@/shared/lib/utils";

type Props = {
  onSave?: () => void;
  // Состояние приходит снаружи (из избранного на сервере). Своего состояния
  // кнопка не держит: раньше она переключалась локально и расходилась с тем,
  // что реально сохранено.
  saved?: boolean;
  savedLabel?: string;
  unsavedLabel?: string;
};

export const SaveButton: FC<Props> = ({
  saved = false,
  savedLabel = "Убрать из сохранённых",
  unsavedLabel = "Сохранить",
  onSave,
}) => {
  return (
    // Белый круг с тенью — как на карточке услуги (entities/service/ui.tsx).
    // Раньше здесь было голое сердечко 24px без фона, и карточки врача и
    // клиники выбивались из общего вида каталога.
    <button
      type="button"
      onClick={() => onSave?.()}
      aria-label={saved ? savedLabel : unsavedLabel}
      className="w-12 h-12 rounded-full bg-white flex items-center justify-center hover:bg-surface transition-colors shadow-sm shrink-0"
    >
      <HeartIcon
        className={cn(
          // Размер обязателен: в heart.svg нет width/height (только viewBox),
          // поэтому без класса svg внутри shrink-to-fit кнопки схлопывался в
          // 0×0 — сердечко на карточках врача и клиники было не видно и не
          // нажать (проверено getBoundingClientRect на /specialists).
          "size-6 transition-colors",
          // Заливка только у сохранённого. Незалитому оставляем родную тёмную
          // обводку из svg — так же выглядит сердечко на карточке услуги.
          saved && "[&_path]:fill-[#FFA18D] [&_path]:stroke-[#FFA18D]",
        )}
      />
    </button>
  );
};
