"use client";

import { FC, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { ClinicPageLayout } from "@/widgets/clinic/layout";

import { clinicCabinetKeys, getClinicAppointments } from "@/shared/api";

type Tab = "all" | "upcoming" | "completed" | "cancelled";

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "Все" },
  { key: "upcoming", label: "Предстоящие" },
  { key: "completed", label: "Завершённые" },
  { key: "cancelled", label: "Отменённые" },
];

const STATUS_LABEL: Record<string, string> = {
  upcoming: "Предстоит",
  pending: "Ожидает",
  confirmed: "Подтверждена",
  completed: "Завершён",
  cancelled: "Отменён",
};

export const ClinicAppointmentsPage: FC = () => {
  const [tab, setTab] = useState<Tab>("all");

  const { data, isLoading } = useQuery({
    queryKey: clinicCabinetKeys.appointments({ status: tab }),
    queryFn: () => getClinicAppointments(tab === "all" ? {} : { status: tab }),
  });

  const appointments = data?.data ?? [];

  return (
    <ClinicPageLayout title="Записи">
      <div className="flex gap-1 bg-white rounded-2xl p-1 mb-4 border border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              tab === t.key
                ? "bg-primary text-white"
                : "text-muted hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-border overflow-hidden">
        <div className="grid grid-cols-4 px-5 py-3 border-b border-border">
          <span className="text-muted text-sm font-medium">Пациент</span>
          <span className="text-muted text-sm font-medium">Услуга</span>
          <span className="text-muted text-sm font-medium">Дата / Время</span>
          <span className="text-muted text-sm font-medium">Статус</span>
        </div>

        {isLoading ? (
          <div className="px-5 py-12 text-center text-muted text-sm">
            Загрузка...
          </div>
        ) : appointments.length === 0 ? (
          <div className="px-5 py-12 text-center text-muted text-sm">
            Нет записей
          </div>
        ) : (
          appointments.map((a, i) => (
            <div
              key={a.id}
              className={`grid grid-cols-4 px-5 py-4 ${
                i !== appointments.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <span className="text-foreground text-sm font-medium">
                {a.patient.full_name}
              </span>
              <span className="text-muted text-sm">
                {a.service?.name ?? "—"}
              </span>
              <span className="text-muted text-sm">
                {a.date} {a.time}
              </span>
              <span
                className={`text-sm font-medium ${
                  a.status === "upcoming"
                    ? "text-primary"
                    : a.status === "completed"
                      ? "text-green-600"
                      : "text-muted"
                }`}
              >
                {STATUS_LABEL[a.status] ?? a.status}
              </span>
            </div>
          ))
        )}
      </div>
    </ClinicPageLayout>
  );
};
