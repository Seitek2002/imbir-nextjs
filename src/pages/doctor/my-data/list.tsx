"use client";

import { FC, ReactNode } from "react";

import { DoctorPageLayout, useMyDataTabs } from "@/widgets/doctor/layout";
import type { MyDataTab } from "@/widgets/doctor/layout";

import { ChevronRightIcon } from "@/shared/assets/icons";
import { colors } from "@/shared/config";

type Item = { icon: ReactNode; id: MyDataTab; label: string };

const ITEMS: Item[] = [
  {
    id: "basic",
    label: "Основная информация",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M10 10C12.2091 10 14 8.20914 14 6C14 3.79086 12.2091 2 10 2C7.79086 2 6 3.79086 6 6C6 8.20914 7.79086 10 10 10Z"
          stroke={colors.primary}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3 18C3 15.2386 6.13401 13 10 13C13.866 13 17 15.2386 17 18"
          stroke={colors.primary}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "professional",
    label: "Профессиональные данные",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M5 2.5V7.5C5 9.15685 6.34315 10.5 8 10.5C9.65685 10.5 11 9.15685 11 7.5V2.5"
          stroke={colors.primary}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M8 10.5V13C8 15.4853 10.0147 17.5 12.5 17.5C14.9853 17.5 17 15.4853 17 13V11.5"
          stroke={colors.primary}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M17 11.5C17.8284 11.5 18.5 10.8284 18.5 10C18.5 9.17157 17.8284 8.5 17 8.5C16.1716 8.5 15.5 9.17157 15.5 10C15.5 10.8284 16.1716 11.5 17 11.5Z"
          stroke={colors.primary}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "education",
    label: "Образование",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M10 2.5L18.3333 6.66667L10 10.8333L1.66667 6.66667L10 2.5Z"
          stroke={colors.primary}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5 8.75V13.3333C5 13.3333 6.66667 15.4167 10 15.4167C13.3333 15.4167 15 13.3333 15 13.3333V8.75"
          stroke={colors.primary}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    id: "documents",
    label: "Сертификаты и документы",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M11.6667 1.66667H5C4.55797 1.66667 4.13405 1.84226 3.82149 2.15482C3.50893 2.46738 3.33333 2.89131 3.33333 3.33333V16.6667C3.33333 17.1087 3.50893 17.5326 3.82149 17.8452C4.13405 18.1577 4.55797 18.3333 5 18.3333H15C15.442 18.3333 15.866 18.1577 16.1785 17.8452C16.4911 17.5326 16.6667 17.1087 16.6667 16.6667V6.66667L11.6667 1.66667Z"
          stroke={colors.primary}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11.6667 1.66667V6.66667H16.6667"
          stroke={colors.primary}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

// Мобильный экран «Мои данные» из макета: список разделов, каждый открывается
// отдельным экраном. На десктопе этого экрана нет — там все разделы видны
// сразу одним скроллом (overview.tsx), поэтому рендерится он под lg:hidden.
export const DoctorMyDataList: FC = () => {
  const { setActive } = useMyDataTabs();

  return (
    <DoctorPageLayout title="Мои данные">
      <nav className="bg-white rounded-3xl p-2 flex flex-col gap-1">
        {ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActive(item.id)}
            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl hover:bg-surface transition-colors cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-primary-tint flex items-center justify-center shrink-0">
              {item.icon}
            </div>
            <span className="flex-1 text-left font-medium text-base text-foreground">
              {item.label}
            </span>
            <ChevronRightIcon className="w-5 h-5 text-dim shrink-0" />
          </button>
        ))}
      </nav>
    </DoctorPageLayout>
  );
};
