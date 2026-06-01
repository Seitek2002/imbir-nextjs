"use client";

import { FC } from "react";

import Link from "next/link";

import { ClinicSidebar } from "@/widgets/clinic-sidebar";
import { ProceduresList } from "@/widgets/procedures-list";

import { MOCK_PROCEDURES } from "@/entities/clinic-procedure";
import { useClinicCabinet } from "@/entities/clinic-profile";

export const ClinicProceduresPage: FC = () => {
  const { profile } = useClinicCabinet();

  return (
    <div className="w-full min-h-screen">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-4 bg-white border-b border-[#E5E6E8]">
        <h1 className="text-lg font-semibold text-[#191A1B]">Мои процедуры</h1>
        <Link
          href="/clinic-profile/procedures/new"
          className="px-4 py-2 rounded-full bg-[#F5653E] text-white text-sm font-medium hover:bg-[#E5542D] transition-colors"
        >
          Добавить
        </Link>
      </div>

      {/* Desktop Content */}
      <div className="max-w-360 mx-auto px-4 md:px-10 py-4 md:py-8">
        <h1 className="text-[40px] font-semibold text-[#191A1B] mb-8 hidden md:block">
          Мой профиль
        </h1>

        <div className="flex gap-6">
          <ClinicSidebar
            clinicName={profile?.name ?? ""}
            clinicLogo={profile?.logo}
            rating={profile?.rating ?? 0}
          />

          <main className="flex-1 min-w-0">
            <div className="hidden md:flex items-center justify-between mb-6">
              <h2 className="text-[32px] font-semibold text-[#191A1B]">
                Мои процедуры
              </h2>
              <Link
                href="/clinic-profile/procedures/new"
                className="px-6 py-3 rounded-full bg-[#F5653E] text-white font-medium hover:bg-[#E5542D] transition-colors whitespace-nowrap"
              >
                Добавить новую
              </Link>
            </div>

            <ProceduresList procedures={MOCK_PROCEDURES} />
          </main>
        </div>
      </div>
    </div>
  );
};
