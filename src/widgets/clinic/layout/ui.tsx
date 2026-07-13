"use client";

import { FC, ReactNode } from "react";

import { useClinicCabinet } from "@/entities/clinic-profile";

import { cn } from "@/shared/lib/utils";

import { ClinicSidebar } from "./sidebar";

type Props = {
  // Заголовок страницы: в мобильной шапке и (по умолчанию) в desktop-h1.
  title: string;
  // Крупный desktop-заголовок, если отличается от мобильного (напр. «Мой профиль»).
  desktopTitle?: string;
  // Правый слот мобильной шапки (кнопки «Добавить»/«Пригласить» и т.п.).
  mobileAction?: ReactNode;
  // Доп-классы для <main> (напр. "flex flex-col gap-6") сверх "flex-1 min-w-0".
  mainClassName?: string;
  children: ReactNode;
};

// Общая оболочка страниц кабинета клиники: мобильная шапка + контейнер +
// сайдбар (с данными кабинета) + контент. Раньше эта разметка и сам сайдбар
// дублировались на каждой странице клиники. По аналогии с DoctorPageLayout.
export const ClinicPageLayout: FC<Props> = ({
  title,
  desktopTitle,
  mobileAction,
  mainClassName,
  children,
}) => {
  const { profile } = useClinicCabinet();

  return (
    <div className="w-full min-h-screen">
      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between px-4 py-4 bg-white border-b border-border">
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        {mobileAction}
      </div>

      {/* Desktop content */}
      <div className="max-w-360 mx-auto px-4 md:px-10 py-4 md:py-8">
        <h1 className="text-[40px] font-semibold text-foreground mb-8 hidden md:block">
          {desktopTitle ?? title}
        </h1>

        <div className="flex gap-6">
          <ClinicSidebar
            clinicName={profile?.name ?? ""}
            clinicLogo={profile?.logo}
            rating={profile?.rating ?? 0}
          />

          <main className={cn("flex-1 min-w-0", mainClassName)}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
