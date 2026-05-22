"use client";

import { FC, useState } from "react";

import { DoctorPageLayout } from "@/widgets/doctor-page-layout";

import { MOCK_APPOINTMENTS } from "@/entities/doctor-profile";

type Tab = "all" | "upcoming" | "completed";

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "Все" },
  { key: "upcoming", label: "Предстоящие" },
  { key: "completed", label: "Завершённые" },
];

export const DoctorAppointmentsPage: FC = () => {
  const [tab, setTab] = useState<Tab>("all");

  const filtered = MOCK_APPOINTMENTS.filter((a) => {
    if (tab === "all") return true;
    if (tab === "upcoming") return a.status === "upcoming";
    return a.status === "completed";
  });

  return (
    <DoctorPageLayout title="Записи">
      <h2 className="text-[28px] font-semibold text-[#191A1B] mb-6 hidden lg:block">
        Записи
      </h2>

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
        <div className="grid grid-cols-2 px-5 py-3 border-b border-[#E5E6E8]">
          <span className="text-[#838A8D] text-sm font-medium">Пациент</span>
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
              className={`grid grid-cols-2 px-5 py-4 ${
                i !== filtered.length - 1 ? "border-b border-[#E5E6E8]" : ""
              }`}
            >
              <span className="text-[#191A1B] text-sm font-medium">
                {a.patientName}
              </span>
              <span className="text-[#838A8D] text-sm">{a.lastVisit}</span>
            </div>
          ))
        )}
      </div>
    </DoctorPageLayout>
  );
};
