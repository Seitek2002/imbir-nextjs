"use client";

import { ReactNode } from "react";

type Tab<T extends string> = {
  icon: ReactNode;
  id: T;
  label: string;
};

type Props<T extends string> = {
  className?: string;
  onChange: (value: T) => void;
  tabs: Tab<T>[];
  value: T;
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
              ? "bg-primary text-white"
              : "bg-[#F2F4F7] text-secondary hover:bg-border"
          }`}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
