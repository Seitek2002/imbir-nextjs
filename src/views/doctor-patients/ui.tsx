"use client";

import { FC } from "react";

import { DoctorPageLayout } from "@/widgets/doctor-page-layout";

import { MOCK_APPOINTMENTS } from "@/entities/doctor-profile";

const PatientAvatar = ({ initial }: { initial: string }) => (
  <div className="w-9 h-9 rounded-full bg-[#FFF0EE] flex items-center justify-center shrink-0">
    <span className="text-[#F5653E] font-semibold text-sm">{initial}</span>
  </div>
);

export const DoctorPatientsPage: FC = () => (
  <DoctorPageLayout title="Пациенты">
    <h2 className="text-[28px] font-semibold text-[#191A1B] mb-6 hidden lg:block">
      Пациенты
    </h2>

    <div className="bg-white rounded-3xl border border-[#E5E6E8] overflow-hidden">
      <div className="grid grid-cols-2 px-5 py-3 border-b border-[#E5E6E8]">
        <span className="text-[#838A8D] text-sm font-medium">Пациент</span>
        <span className="text-[#838A8D] text-sm font-medium">
          Последний визит
        </span>
      </div>

      {MOCK_APPOINTMENTS.map((a, i) => (
        <div
          key={a.id}
          className={`flex items-center gap-3 px-5 py-3.5 ${
            i !== MOCK_APPOINTMENTS.length - 1
              ? "border-b border-[#E5E6E8]"
              : ""
          }`}
        >
          <PatientAvatar initial={a.patientName.charAt(0)} />
          <span className="flex-1 text-[#191A1B] text-sm font-medium">
            {a.patientName}
          </span>
          <span className="text-[#838A8D] text-sm">{a.lastVisit}</span>
        </div>
      ))}
    </div>
  </DoctorPageLayout>
);
