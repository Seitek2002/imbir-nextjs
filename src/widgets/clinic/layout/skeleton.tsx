"use client";

import { FC, ReactNode } from "react";

import { useClinicCabinet } from "@/entities/clinic-profile";

import { ClinicSidebar } from "./sidebar";

type Props = {
  children: ReactNode;
};

// Постоянный каркас кабинета клиники (по аналогии с DoctorPageLayoutSkeleton):
// заголовок и сайдбар живут в route-layout и не перемонтируются при переходе
// между вкладками — индикатор меню плавно едет к активному пункту. Страницы
// рендерят только контент через ClinicPageLayout.
export const ClinicPageLayoutSkeleton: FC<Props> = ({ children }) => {
  const { profile } = useClinicCabinet();

  return (
    <div className="w-full min-h-screen">
      <div className="max-w-360 mx-auto md:px-10 md:py-8">
        <h1 className="text-[40px] font-semibold text-foreground mb-8 hidden md:block">
          Мой профиль
        </h1>

        <div className="flex gap-6">
          <ClinicSidebar
            clinicName={profile?.name ?? ""}
            clinicLogo={profile?.logo}
            rating={profile?.rating ?? 0}
          />

          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
};
