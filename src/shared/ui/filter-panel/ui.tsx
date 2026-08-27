"use client";

import { FC } from "react";

type Props = {
  emptyMessage?: string;
  label: string;
  onSelect: (value: null | string) => void;
  options: string[];
  selected: null | string;
};

export const FilterPanel: FC<Props> = ({
  label,
  options,
  selected,
  onSelect,
  emptyMessage = "Нет доступных вариантов",
}) => (
  <div className="bg-white rounded-2xl border border-border p-4 mb-4">
    <div className="flex items-center justify-between mb-3">
      <p className="text-sm font-medium text-foreground">{label}</p>
      {selected && (
        <button
          onClick={() => onSelect(null)}
          className="text-xs text-primary hover:underline"
        >
          Сбросить
        </button>
      )}
    </div>
    {options.length === 0 ? (
      <p className="text-sm text-muted">{emptyMessage}</p>
    ) : (
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onSelect(selected === opt ? null : opt)}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              selected === opt
                ? "bg-primary text-white"
                : "border border-border text-secondary hover:border-primary hover:text-primary"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    )}
  </div>
);
