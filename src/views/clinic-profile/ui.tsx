"use client";

import { FC } from "react";

import { ClinicSidebar } from "@/widgets/clinic-sidebar";

import { ClinicProfileForm } from "@/entities/clinic-profile";
import { MOCK_CLINIC_PROFILE } from "@/entities/clinic-profile";

export const ClinicProfilePage: FC = () => {
  const handleSave = () => {
    console.log("Save clinic profile");
  };

  return (
    <div className="w-full min-h-screen">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-4 bg-white border-b border-[#E5E6E8]">
        <h1 className="text-lg font-semibold text-[#191A1B]">Моя клиника</h1>
        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-full bg-[#F5653E] text-white text-sm font-medium hover:bg-[#E5542D] transition-colors"
        >
          Сохранить
        </button>
      </div>

      {/* Desktop Content */}
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
                Моя клиника
              </h2>
              <button
                onClick={handleSave}
                className="px-6 py-3 rounded-full bg-[#F5653E] text-white font-medium hover:bg-[#E5542D] transition-colors"
              >
                Сохранить
              </button>
            </div>

            <ClinicProfileForm {...MOCK_CLINIC_PROFILE} />
          </main>
        </div>
      </div>
    </div>
  );
};
