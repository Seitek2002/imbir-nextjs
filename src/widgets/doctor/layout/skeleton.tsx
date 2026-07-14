"use client";

import { FC, ReactNode } from "react";

import { useDoctorCabinet } from "./doctor-profile/useDoctorCabinet";
import { DoctorSidebar } from "./sidebar";

type Props = {
  children: ReactNode;
};

export const DoctorPageLayoutSkeleton: FC<Props> = ({ children }) => {
  const { profile } = useDoctorCabinet();

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA]">
      {/* Desktop layout */}
      <div className="max-w-360 mx-auto px-4 lg:px-10 py-4 lg:py-8">
        <h1 className="text-[40px] font-semibold text-foreground mb-8 hidden lg:block">
          Мой профиль
        </h1>

        <div className="flex gap-6">
          <div className="hidden lg:block">
            <DoctorSidebar
              fullName={profile?.fullName ?? ""}
              photo={profile?.photo}
              specialty={profile?.specialty ?? ""}
              rating={profile?.rating ?? 0}
            />
          </div>

          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
};
