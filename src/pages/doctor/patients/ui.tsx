"use client";

import { FC } from "react";

import { useQuery } from "@tanstack/react-query";

import { DoctorPageLayout } from "@/widgets/doctor/layout";

import { StartChatButton } from "@/features/start-chat";

import {
  type DoctorPatient,
  doctorCabinetKeys,
  getDoctorPatients,
} from "@/shared/api";

// "2026-04-30" → "30.04.2026".
const fmtDate = (iso: string): string => {
  const parts = iso?.split("-");
  if (parts?.length === 3) return `${parts[2]}.${parts[1]}.${parts[0]}`;
  return iso || "—";
};

// Диагноз в списке пациентов бэк пока не отдаёт — показываем прочерк.
const diagnosisOf = (p: DoctorPatient): string =>
  (p as unknown as { diagnosis?: string }).diagnosis || "—";

export const DoctorPatientsPage: FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: doctorCabinetKeys.patients({}),
    queryFn: () => getDoctorPatients(),
  });

  const patients = data?.data ?? [];
  const th = "px-6 py-4 text-muted text-sm font-normal whitespace-nowrap";
  const td = "px-6 py-4 whitespace-nowrap";

  return (
    <DoctorPageLayout title="Пациенты">
      <h2 className="text-[32px] font-semibold text-foreground mb-6 hidden lg:block">
        Пациенты
      </h2>

      {isLoading ? (
        <div className="bg-white rounded-3xl border border-border px-6 py-16 text-center text-muted text-sm">
          Загрузка...
        </div>
      ) : patients.length === 0 ? (
        <div className="bg-white rounded-3xl border border-border px-6 py-16 text-center text-muted text-sm">
          Нет пациентов
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-160 text-left border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className={th}>Пациент</th>
                  <th className={th}>Последний визит</th>
                  <th className={th}>Диагноз</th>
                  <th className="px-6 py-4" />
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-border last:border-0"
                  >
                    <td className={`${td} text-foreground font-medium`}>
                      {p.full_name}
                    </td>
                    <td className={`${td} text-foreground`}>
                      {fmtDate(p.last_visit)}
                    </td>
                    <td className={`${td} text-foreground`}>
                      {diagnosisOf(p)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <StartChatButton
                        userId={p.id}
                        size="sm"
                        variant="outline"
                        label="Открыть чат"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </DoctorPageLayout>
  );
};
