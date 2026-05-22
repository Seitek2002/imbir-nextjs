"use client";

import { FC } from "react";

import { useRouter } from "next/navigation";

import { DoctorSidebar } from "@/widgets/doctor-sidebar";

import {
  MOCK_APPOINTMENTS,
  MOCK_DOCTOR_PROFILE,
} from "@/entities/doctor-profile";

const BackIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path
      d="M15 18L9 12L15 6"
      stroke="#191A1B"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PersonIcon = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
    <circle cx="18" cy="18" r="18" fill="#FFF0EE" />
    <path
      d="M18 18C20.2091 18 22 16.2091 22 14C22 11.7909 20.2091 10 18 10C15.7909 10 14 11.7909 14 14C14 16.2091 15.7909 18 18 18Z"
      stroke="#F5653E"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11 26C11 23.2386 14.134 21 18 21C21.866 21 25 23.2386 25 26"
      stroke="#F5653E"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const DoctorPatientsPage: FC = () => {
  const router = useRouter();
  const d = MOCK_DOCTOR_PROFILE;

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA]">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between px-4 py-4 bg-white border-b border-[#E5E6E8]">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#F8F9FA] transition-colors"
        >
          <BackIcon />
        </button>
        <h1 className="text-lg font-semibold text-[#191A1B]">Пациенты</h1>
        <div className="w-10" />
      </div>

      <div className="max-w-360 mx-auto px-4 lg:px-10 py-4 lg:py-8">
        <h1 className="text-[40px] font-semibold text-[#191A1B] mb-8 hidden lg:block">
          Мой профиль
        </h1>
        <div className="flex gap-6">
          <div className="hidden lg:block">
            <DoctorSidebar
              fullName={d.fullName}
              photo={d.photo}
              specialty={d.specialty}
              rating={d.rating}
            />
          </div>

          <main className="flex-1 min-w-0">
            <h2 className="text-[28px] font-semibold text-[#191A1B] mb-6 hidden lg:block">
              Пациенты
            </h2>

            <div className="bg-white rounded-3xl border border-[#E5E6E8] overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-2 px-5 py-3 border-b border-[#E5E6E8]">
                <span className="text-[#838A8D] text-sm font-medium">
                  Пациент
                </span>
                <span className="text-[#838A8D] text-sm font-medium">
                  Последний визит
                </span>
              </div>

              {MOCK_APPOINTMENTS.map((a, i) => (
                <div
                  key={a.id}
                  className={`flex items-center gap-3 px-5 py-3.5 ${i !== MOCK_APPOINTMENTS.length - 1 ? "border-b border-[#E5E6E8]" : ""}`}
                >
                  <PersonIcon />
                  <span className="flex-1 text-[#191A1B] text-sm font-medium">
                    {a.patientName}
                  </span>
                  <span className="text-[#838A8D] text-sm">{a.lastVisit}</span>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
