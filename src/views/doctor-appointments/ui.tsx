"use client";

import { FC, useState } from "react";

import { useRouter } from "next/navigation";

import { DoctorSidebar } from "@/widgets/doctor-sidebar";

import {
  MOCK_APPOINTMENTS,
  MOCK_DOCTOR_PROFILE,
} from "@/entities/doctor-profile";

type Tab = "all" | "upcoming" | "completed";

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

export const DoctorAppointmentsPage: FC = () => {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("all");
  const d = MOCK_DOCTOR_PROFILE;

  const filtered = MOCK_APPOINTMENTS.filter((a) => {
    if (tab === "all") return true;
    if (tab === "upcoming") return a.status === "upcoming";
    return a.status === "completed";
  });

  const TABS: { key: Tab; label: string }[] = [
    { key: "all", label: "Все" },
    { key: "upcoming", label: "Предстоящие" },
    { key: "completed", label: "Завершённые" },
  ];

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
        <h1 className="text-lg font-semibold text-[#191A1B]">Записи</h1>
        <div className="w-10" />
      </div>

      {/* Desktop layout */}
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
              Записи
            </h2>

            {/* Tabs */}
            <div className="flex gap-1 bg-white rounded-2xl p-1 mb-4 border border-[#E5E6E8]">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    tab === t.key
                      ? "bg-[#F5653E] text-white"
                      : "text-[#838A8D] hover:text-[#191A1B]"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

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

              {filtered.length === 0 ? (
                <div className="px-5 py-12 text-center text-[#838A8D] text-sm">
                  Нет записей
                </div>
              ) : (
                filtered.map((a, i) => (
                  <div
                    key={a.id}
                    className={`grid grid-cols-2 px-5 py-4 ${i !== filtered.length - 1 ? "border-b border-[#E5E6E8]" : ""}`}
                  >
                    <span className="text-[#191A1B] text-sm font-medium">
                      {a.patientName}
                    </span>
                    <span className="text-[#838A8D] text-sm">
                      {a.lastVisit}
                    </span>
                  </div>
                ))
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
