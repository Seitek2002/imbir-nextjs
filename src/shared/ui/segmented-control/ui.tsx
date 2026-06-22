"use client";

import { ReactNode } from "react";

// Используем дженерик <T>, чтобы TypeScript строго типизировал значения (value)
export type SegmentOption<T extends string> = {
  label: string | ReactNode;
  value: T;
};

type Props<T extends string> = {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

export const SegmentedControl = <T extends string>({
  options,
  value,
  onChange,
}: Props<T>) => {
  const selectedIndex = options.findIndex((opt) => opt.value === value);

  return (
    <div className="relative flex items-center bg-background p-1 rounded-full w-full select-none">
      {/* Анимированная белая подложка */}
      <div
        className="absolute top-1 bottom-1 bg-white rounded-full shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-transform duration-300 ease-in-out"
        style={{
          width: `calc((100% - 8px) / ${options.length})`,
          transform: `translateX(calc(${selectedIndex} * 100%))`,
          left: "4px",
        }}
      />

      {/* Сами кнопки-сегменты */}
      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`relative z-10 flex-1 py-2 text-sm font-medium transition-colors duration-300 outline-none ${
              isSelected
                ? "text-foreground"
                : "text-secondary hover:text-foreground"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
