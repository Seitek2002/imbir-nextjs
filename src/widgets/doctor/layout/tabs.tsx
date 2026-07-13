"use client";

import { FC } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const DoctorMyDataTabs: FC = () => {
  const pathname = usePathname() ?? "";

  const tabs = [
    { href: "/doctor-profile/my-data/basic", label: "Основная информация" },
    {
      href: "/doctor-profile/my-data/professional",
      label: "Профессиональные данные",
    },
    { href: "/doctor-profile/my-data/education", label: "Образование" },
    {
      href: "/doctor-profile/my-data/documents",
      label: "Сертификаты и документы",
    },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none -mx-4 px-4 lg:mx-0 lg:px-0">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
              isActive
                ? "bg-primary text-white shadow-xs"
                : "bg-white border border-border text-secondary hover:bg-surface"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
};
