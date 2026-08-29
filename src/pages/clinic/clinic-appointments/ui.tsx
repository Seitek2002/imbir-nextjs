"use client";

import { FC, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { ClinicPageLayout } from "@/widgets/clinic/layout";

import {
  type DoctorAppointment,
  clinicCabinetKeys,
  getClinicAppointments,
} from "@/shared/api";
import { fmtDate, fmtTime } from "@/shared/lib/datetime";
import { cn } from "@/shared/lib/utils";
import { ViewModeToggle, useListView } from "@/shared/ui";
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

// Цвет статуса нужен и в таблице, и в мобильной карточке — держим в одном месте.
const statusColor = (status: string): string =>
  status === "pending"
    ? "text-info"
    : status === "upcoming"
      ? "text-primary"
      : status === "completed"
        ? "text-green-600"
        : "text-muted";

// Мобильная карточка записи. Раньше здесь скроллилась вбок та же
// четырёхколоночная сетка, что и на десктопе: на 390px было видно имя
// пациента и половину услуги, а статус — ради которого в список и заходят —
// оставался за краем экрана.
const AppointmentCard: FC<{ appointment: DoctorAppointment }> = ({
  appointment: a,
}) => {
  const isNew = a.status === "pending";

  return (
    <div
      className={`rounded-2xl border p-3 ${
        isNew ? "border-info bg-info-tint" : "border-border bg-white"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-foreground">
          {a.patient.full_name}
        </p>
        <span
          className={`text-xs font-medium shrink-0 ${statusColor(a.status)}`}
        >
          {STATUS_LABEL[a.status] ?? a.status}
        </span>
      </div>
      <p className="text-xs text-muted mt-1">{a.service?.name ?? "—"}</p>
      <p className="text-xs text-muted mt-0.5">
        {fmtDate(a.date)} {fmtTime(a.time)}
      </p>
    </div>
  );
};

// Заглушка мобильного списка — те же карточки, чтобы ничего не прыгало.
const AppointmentsMobileSkeleton: FC = () => (
  <div className="flex flex-col gap-3">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="bg-white rounded-2xl border border-border p-3">
        <div className="h-4 w-40 rounded-md skeleton" />
        <div className="h-3 w-32 rounded-md skeleton mt-2" />
        <div className="h-3 w-24 rounded-md skeleton mt-2" />
      </div>
    ))}
  </div>
);

export const ClinicAppointmentsPage: FC = () => {
  const [tab, setTab] = useState<Tab>("all");

  const { data, isLoading } = useQuery({
    queryKey: clinicCabinetKeys.appointments({ status: tab }),
    queryFn: () => getClinicAppointments(tab === "all" ? {} : { status: tab }),
  });

  const appointments = data?.data ?? [];
  const {
    mode: viewMode,
    setMode: setViewMode,
    cardsClassName,
    tableClassName,
  } = useListView();

  return (
    <ClinicPageLayout title="Записи">
      {/* На узком экране переключатель уезжает под вкладки: сегмент делит
          ширину поровну между четырьмя вкладками, и рядом с ним подписи
          слипались. */}
      <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-center">
        <div className="md:flex-1 md:min-w-0">
          <SegmentedControl options={TABS} value={tab} onChange={setTab} />
        </div>
        <div className="flex justify-end">
          <ViewModeToggle mode={viewMode} onChange={setViewMode} />
        </div>
      </div>

      {/* Карточки: по умолчанию до md, дальше — по выбору пользователя. */}
      <div className={cn("flex flex-col gap-3", cardsClassName)}>
        {isLoading ? (
          <AppointmentsMobileSkeleton />
        ) : appointments.length === 0 ? (
          <div className="bg-white rounded-3xl border border-border px-5 py-14 flex flex-col items-center gap-2 text-center">
            <p className="text-foreground font-medium">
              {tab === "all" ? "Записей пока нет" : "В этой вкладке пусто"}
            </p>
            <p className="text-muted text-sm max-w-80">{EMPTY_TEXT[tab]}</p>
          </div>
        ) : (
          appointments.map((a) => (
            <AppointmentCard key={a.id} appointment={a} />
          ))
        )}
      </div>

      <div
        className={cn(
          "bg-white rounded-3xl border border-border overflow-hidden",
          tableClassName,
        )}
      >
        {/* Четырёхколоночная сетка не влезает в телефон — по умолчанию её
            заменяют карточки выше, но пользователь может выбрать и её. */}
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
                      className={`text-sm font-medium ${statusColor(a.status)}`}
                    >
                      {STATUS_LABEL[a.status] ?? a.status}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Пустое состояние — снаружи сетки шириной 640px: внутри неё текст
            центрировался по этим 640px и на телефоне обрезался справа. */}
        {!isLoading && appointments.length === 0 && (
          <div className="px-5 py-14 flex flex-col items-center gap-2 text-center">
            <p className="text-foreground font-medium">
              {tab === "all" ? "Записей пока нет" : "В этой вкладке пусто"}
            </p>
            <p className="text-muted text-sm max-w-80">{EMPTY_TEXT[tab]}</p>
          </div>
        )}
      </div>
    </ClinicPageLayout>
  );
};
