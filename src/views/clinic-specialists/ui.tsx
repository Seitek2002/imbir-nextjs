"use client";

import { FC } from "react";

import Link from "next/link";

import { ClinicSidebar } from "@/widgets/clinic-sidebar";
import { SpecialistsList } from "@/widgets/specialists-list";

import { MOCK_CLINIC_PROFILE } from "@/entities/clinic-profile";
import { useSpecialistsStore } from "@/entities/clinic-specialist";
import type { Specialist } from "@/entities/clinic-specialist";

export const ClinicSpecialistsPage: FC = () => {
  const { specialists, remove } = useSpecialistsStore();

  const listItems: Specialist[] = specialists.map((s) => ({
    id: s.id,
    name: s.fullName,
    specialty: s.specialty,
    clinic: s.workplace,
    rating: s.rating,
    reviews: s.reviews,
    experience: parseInt(s.experienceYears) || 0,
    image: s.photo || undefined,
  }));

  return (
    <div className="w-full min-h-screen">
      <div className="md:hidden flex items-center justify-between px-4 py-4 bg-white border-b border-[#E5E6E8]">
        <h1 className="text-lg font-semibold text-[#191A1B]">
          Мои специалисты
        </h1>
        <Link
          href="/clinic-profile/specialists/new"
          className="px-4 py-2 rounded-full bg-[#F5653E] text-white text-sm font-medium hover:bg-[#E5542D] transition-colors"
        >
          Добавить
        </Link>
      </div>

      <div className="max-w-360 mx-auto px-4 md:px-10 py-4 md:py-8">
        <h1 className="text-[40px] font-semibold text-[#191A1B] mb-8 hidden md:block">
          Мой профиль
        </h1>

        <div className="flex gap-6">
          <ClinicSidebar
            clinicName={MOCK_CLINIC_PROFILE.name}
            clinicLogo={MOCK_CLINIC_PROFILE.logo}
            rating={MOCK_CLINIC_PROFILE.rating}
          />

          <main className="flex-1 min-w-0">
            <div className="hidden md:flex items-center justify-between mb-6">
              <h2 className="text-[32px] font-semibold text-[#191A1B]">
                Мои специалисты
              </h2>
              <Link
                href="/clinic-profile/specialists/new"
                className="px-6 py-3 rounded-full bg-[#F5653E] text-white font-medium hover:bg-[#E5542D] transition-colors whitespace-nowrap"
              >
                Добавить нового
              </Link>
            </div>

            <SpecialistsList specialists={listItems} onDelete={remove} />
          </main>
        </div>
      </div>
    </div>
  );
};
