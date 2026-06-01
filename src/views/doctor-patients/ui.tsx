"use client";

import { FC } from "react";

import { useQuery } from "@tanstack/react-query";

import { DoctorPageLayout } from "@/widgets/doctor-page-layout";

import { getDoctorPatients } from "@/shared/api/doctor-cabinet/requests";
import { doctorCabinetKeys } from "@/shared/api/queryKeys";

const PatientAvatar = ({ initial }: { initial: string }) => (
  <div className="w-9 h-9 rounded-full bg-[#FFF0EE] flex items-center justify-center shrink-0">
    <span className="text-[#F5653E] font-semibold text-sm">{initial}</span>
  </div>
);

export const DoctorPatientsPage: FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: doctorCabinetKeys.patients({}),
    queryFn: () => getDoctorPatients(),
  });

  const patients = data?.data ?? [];

  return (
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

        {isLoading ? (
          <div className="px-5 py-12 text-center text-[#838A8D] text-sm">
            Загрузка...
          </div>
        ) : patients.length === 0 ? (
          <div className="px-5 py-12 text-center text-[#838A8D] text-sm">
            Нет пациентов
          </div>
        ) : (
          patients.map((p, i) => (
            <div
              key={p.id}
              className={`flex items-center gap-3 px-5 py-3.5 ${
                i !== patients.length - 1 ? "border-b border-[#E5E6E8]" : ""
              }`}
            >
              <PatientAvatar initial={p.full_name.charAt(0)} />
              <span className="flex-1 text-[#191A1B] text-sm font-medium">
                {p.full_name}
              </span>
              <span className="text-[#838A8D] text-sm">{p.last_visit}</span>
            </div>
          ))
        )}
      </div>
    </DoctorPageLayout>
  );
};
