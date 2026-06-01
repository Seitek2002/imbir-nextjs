"use client";

import { FC } from "react";

type Props = {
  label: string;
  options: string[];
  selected: string | null;
  onSelect: (value: string | null) => void;
};

export const FilterPanel: FC<Props> = ({
  label,
  options,
  selected,
  onSelect,
}) => (
  <div className="bg-white rounded-2xl border border-[#E5E6E8] p-4 mb-4">
    <div className="flex items-center justify-between mb-3">
      <p className="text-sm font-medium text-[#191A1B]">{label}</p>
      {selected && (
        <button
          onClick={() => onSelect(null)}
          className="text-xs text-[#F5653E] hover:underline"
        >
          Сбросить
        </button>
      )}
    </div>
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onSelect(selected === opt ? null : opt)}
          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
            selected === opt
              ? "bg-[#F5653E] text-white"
              : "border border-[#E5E6E8] text-[#686F72] hover:border-[#F5653E] hover:text-[#F5653E]"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  </div>
);
