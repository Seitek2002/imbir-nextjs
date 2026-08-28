"use client";

import { FC, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { ClinicPageLayout } from "@/widgets/clinic/layout";

import { clinicCabinetKeys, getClinicAppointments } from "@/shared/api";
import { fmtDate, fmtTime } from "@/shared/lib/datetime";
import { SegmentedControl } from "@/shared/ui/segmented-control";

type Tab = "all" | "cancelled" | "completed" | "upcoming";

const TABS = [
  { value: "all" as const, label: "Все" },
  { value: "upcoming" as const, label: "Предстоящие" },
  { value: "completed" as const, label: "Завершённые" },
  { value: "cancelled" as const, label: "Отменённые" },
];

// Пустой список объясняем в терминах выбранной вкладки: «Нет записей» под
// фильтром «Отменённые» читалось как «в клинике вообще нет записей».
const EMPTY_TEXT: Record<Tab, string> = {
  all: "Записей пока нет. Они появятся здесь, как только пациенты запишутся на приём.",
  upcoming:
    "Предстоящих приёмов нет. Здесь будут записи, которые ещё не состоялись.",
  completed: "Завершённых приёмов пока нет.",
  cancelled: "Отменённых записей нет — и это хорошо.",
};

const STATUS_LABEL: Record<string, string> = {
  upcoming: "Предстоит",
  pending: "Новая",
  confirmed: "Подтверждена",
  completed: "Завершён",
  cancelled: "Отменён",
};

// Сетка одна на шапку, строки и скелет — иначе колонки расходятся.
// border-l есть у каждой строки, просто обычно прозрачная: иначе у выделенной
// строки колонки съезжают на 4px относительно соседних.
const ROW = "grid grid-cols-[1.4fr_1.6fr_1fr_0.8fr] gap-4 px-5 border-l-4";

// Скелет повторяет строку списка, чтобы при появлении данных ничего не прыгало.
const AppointmentsSkeleton: FC = () => (
  <>
    {Array.from({ length: 5 }).map((_, i) => (
      <div
        key={i}
        className={`${ROW} border-l-transparent py-4 border-b border-border last:border-0 items-center`}
      >
        <div className="h-4 w-36 rounded-md skeleton" />
        <div className="h-4 w-44 rounded-md skeleton" />
        <div className="h-4 w-28 rounded-md skeleton" />
        <div className="h-4 w-24 rounded-md skeleton" />
      </div>
    ))}
  </>
);

export const ClinicAppointmentsPage: FC = () => {
  const [tab, setTab] = useState<Tab>("all");

  const { data, isLoading } = useQuery({
    queryKey: clinicCabinetKeys.appointments({ status: tab }),
    queryFn: () => getClinicAppointments(tab === "all" ? {} : { status: tab }),
  });

  const appointments = data?.data ?? [];

  return (
    <ClinicPageLayout title="Записи">
      <div className="mb-4">
        <SegmentedControl options={TABS} value={tab} onChange={setTab} />
      </div>

      <div className="bg-white rounded-3xl border border-border overflow-hidden">
        {/* Четырёхколоночная сетка не влезает в телефон: без min-w имена и услуги
            сжимались в нечитаемый столбик. Скроллим горизонтально, как в кабинете врача. */}
        <div className="overflow-x-auto">
          <div className="min-w-160">
            <div
              className={`${ROW} border-l-transparent py-3 border-b border-border`}
            >
              <span className="text-muted text-sm font-medium">Пациент</span>
              <span className="text-muted text-sm font-medium">Услуга</span>
              <span className="text-muted text-sm font-medium">
                Дата / Время
              </span>
              <span className="text-muted text-sm font-medium">Статус</span>
            </div>

            {isLoading ? (
              <AppointmentsSkeleton />
            ) : appointments.length === 0 ? (
              <div className="px-5 py-14 flex flex-col items-center gap-2 text-center">
                <p className="text-foreground font-medium">
                  {tab === "all" ? "Записей пока нет" : "В этой вкладке пусто"}
                </p>
                <p className="text-muted text-sm max-w-80">{EMPTY_TEXT[tab]}</p>
              </div>
            ) : (
              appointments.map((a, i) => {
                // Новая запись — та, что ещё ждёт подтверждения клиники.
                const isNew = a.status === "pending";

                return (
                  <div
                    key={a.id}
                    className={`${ROW} py-4 items-center ${
                      i !== appointments.length - 1
                        ? "border-b border-border"
                        : ""
                    } ${isNew ? "bg-info-tint border-l-info" : "border-l-transparent"}`}
                  >
                    <span className="text-foreground text-sm font-medium">
                      {a.patient.full_name}
                    </span>
                    <span className="text-muted text-sm">
                      {a.service?.name ?? "—"}
                    </span>
                    <span className="text-muted text-sm whitespace-nowrap">
                      {fmtDate(a.date)} {fmtTime(a.time)}
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        isNew
                          ? "text-info"
                          : a.status === "upcoming"
                            ? "text-primary"
                            : a.status === "completed"
                              ? "text-green-600"
                              : "text-muted"
                      }`}
                    >
                      {STATUS_LABEL[a.status] ?? a.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </ClinicPageLayout>
  );
};
