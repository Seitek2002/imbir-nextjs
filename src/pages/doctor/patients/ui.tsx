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
        <>
          {/* ── Desktop: таблица ───────────────────────────────── */}
          <div className="hidden md:block bg-white rounded-3xl border border-border overflow-hidden">
            <div className="grid grid-cols-[1.5fr_1fr_1.3fr_auto] gap-4 px-6 py-4 border-b border-border">
              <span className="text-muted text-sm">Пациент</span>
              <span className="text-muted text-sm">Последний визит</span>
              <span className="text-muted text-sm">Диагноз</span>
              <span />
            </div>

            {patients.map((p, i) => (
              <div
                key={p.id}
                className={`grid grid-cols-[1.5fr_1fr_1.3fr_auto] gap-4 px-6 py-4 items-center ${
                  i !== patients.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <span className="text-foreground font-medium">
                  {p.full_name}
                </span>
                <span className="text-foreground">{fmtDate(p.last_visit)}</span>
                <span className="text-foreground">{diagnosisOf(p)}</span>
                <StartChatButton
                  userId={p.id}
                  size="sm"
                  variant="outline"
                  label="Открыть чат"
                />
              </div>
            ))}
          </div>

          {/* ── Mobile: карточки ───────────────────────────────── */}
          <div className="md:hidden flex flex-col gap-3">
            {patients.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-border p-4"
              >
                <span className="text-foreground font-medium">
                  {p.full_name}
                </span>
                <div className="flex flex-col gap-1 mt-2 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-muted">Последний визит</span>
                    <span className="text-foreground">
                      {fmtDate(p.last_visit)}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-muted">Диагноз</span>
                    <span className="text-foreground">{diagnosisOf(p)}</span>
                  </div>
                </div>
                <StartChatButton
                  userId={p.id}
                  size="sm"
                  variant="outline"
                  label="Открыть чат"
                  className="w-full mt-3"
                />
              </div>
            ))}
          </div>
        </>
      )}
    </DoctorPageLayout>
  );
};
