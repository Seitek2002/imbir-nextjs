"use client";

import { ReactNode } from "react";

type Tab<T extends string> = {
  id: T;
  label: string;
  icon: ReactNode;
};

type Props<T extends string> = {
  tabs: Tab<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

export function FilterTabBar<T extends string>({
  tabs,
  value,
  onChange,
  className = "",
}: Props<T>) {
  return (
    <div
      className={`flex gap-2 overflow-x-auto pb-2 scrollbar-hide ${className}`}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`px-4 py-2.5 rounded-full font-medium text-sm whitespace-nowrap transition-all flex items-center gap-2 shrink-0 ${
            value === tab.id
              ? "bg-[#F5653E] text-white"
              : "bg-[#F2F4F7] text-[#686F72] hover:bg-[#E5E6E8]"
          }`}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
