"use client";

import { FC } from "react";

import { useQuery } from "@tanstack/react-query";

import { DoctorPageLayout } from "@/widgets/doctor-page-layout";

import { getDoctorPatients } from "@/shared/api/doctor-cabinet/requests";
import { doctorCabinetKeys } from "@/shared/api/queryKeys";

const PatientAvatar = ({ initial }: { initial: string }) => (
  <div className="w-9 h-9 rounded-full bg-[#FFF0EE] flex items-center justify-center shrink-0">
    <span className="text-primary font-semibold text-sm">{initial}</span>
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
      <h2 className="text-[28px] font-semibold text-foreground mb-6 hidden lg:block">
        Пациенты
      </h2>

      <div className="bg-white rounded-3xl border border-border overflow-hidden">
        <div className="grid grid-cols-2 px-5 py-3 border-b border-border">
          <span className="text-muted text-sm font-medium">Пациент</span>
          <span className="text-muted text-sm font-medium">
            Последний визит
          </span>
        </div>

        {isLoading ? (
          <div className="px-5 py-12 text-center text-muted text-sm">
            Загрузка...
          </div>
        ) : patients.length === 0 ? (
          <div className="px-5 py-12 text-center text-muted text-sm">
            Нет пациентов
          </div>
        ) : (
          patients.map((p, i) => (
            <div
              key={p.id}
              className={`flex items-center gap-3 px-5 py-3.5 ${
                i !== patients.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <PatientAvatar initial={p.full_name.charAt(0)} />
              <span className="flex-1 text-foreground text-sm font-medium">
                {p.full_name}
              </span>
              <span className="text-muted text-sm">{p.last_visit}</span>
            </div>
          ))
        )}
      </div>
    </DoctorPageLayout>
  );
};
