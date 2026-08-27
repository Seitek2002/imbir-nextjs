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
import { fmtDate } from "@/shared/lib/datetime";

// Диагноз в списке пациентов бэк пока не отдаёт — показываем прочерк.
const diagnosisOf = (p: DoctorPatient): string =>
  (p as unknown as { diagnosis?: string }).diagnosis || "—";

const th = "px-6 py-4 text-muted text-sm font-normal whitespace-nowrap";
const td = "px-6 py-4 whitespace-nowrap";

// Заглушка повторяет саму таблицу — с той же шапкой и теми же колонками,
// чтобы при появлении данных ничего не прыгало.
const PatientsSkeleton: FC = () => (
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
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i} className="border-b border-border last:border-0">
              <td className={td}>
                <div className="h-4 w-40 rounded-md skeleton" />
              </td>
              <td className={td}>
                <div className="h-4 w-24 rounded-md skeleton" />
              </td>
              <td className={td}>
                <div className="h-4 w-32 rounded-md skeleton" />
              </td>
              <td className="px-6 py-4">
                <div className="h-8 w-32 rounded-full skeleton ml-auto" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
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
      <h2 className="text-[32px] font-semibold text-foreground mb-6 hidden lg:block">
        Пациенты
      </h2>

      {isLoading ? (
        <PatientsSkeleton />
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
                      {fmtDate(p.last_visit, "—")}
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
