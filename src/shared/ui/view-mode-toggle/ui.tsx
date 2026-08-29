"use client";

import { FC } from "react";

import { ViewCardsIcon, ViewTableIcon } from "@/shared/assets/icons";
import { cn } from "@/shared/lib/utils";
import type { ListViewMode } from "@/shared/store";

type Props = {
  className?: string;
  mode: ListViewMode;
  onChange: (mode: ListViewMode) => void;
};

const OPTIONS: {
  icon: FC<{ className?: string }>;
  label: string;
  value: ListViewMode;
}[] = [
  { value: "cards", label: "Карточками", icon: ViewCardsIcon },
  { value: "table", label: "Таблицей", icon: ViewTableIcon },
];

/**
 * Переключатель вида списков в кабинете: карточки или таблица.
 *
 * Раньше вид жёстко решала ширина экрана — таблица от md, карточки ниже.
 * Таблица вмещает больше колонок сразу, карточки читаются на узком экране, и
 * что удобнее, зависит не только от устройства: на планшете и на ноутбуке с
 * узким окном выбор разумно оставить пользователю.
 *
 * Кнопки — именно кнопки с aria-pressed, а не радиогруппа: это переключение
 * представления, а не ввод значения в форму.
 */
export const ViewModeToggle: FC<Props> = ({ mode, onChange, className }) => (
  <div
    className={cn(
      "inline-flex items-center gap-0.5 bg-background rounded-full p-1 shrink-0",
      className,
    )}
  >
    {OPTIONS.map(({ value, label, icon: Icon }) => {
      const isActive = mode === value;

      return (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          aria-pressed={isActive}
          aria-label={label}
          title={label}
          className={cn(
            "size-8 flex items-center justify-center rounded-full transition-colors outline-none",
            "focus-visible:shadow-[0_0_1px_3px_rgba(245,101,62,0.45)]",
            isActive
              ? "bg-white text-foreground shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
              : "text-muted hover:text-foreground",
          )}
        >
          <Icon className="size-4" />
        </button>
      );
    })}
  </div>
);
