"use client";

import { FC, useState } from "react";
import toast from "react-hot-toast";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { DoctorPageLayout } from "@/widgets/doctor/layout";

import {
  type DoctorAppointment,
  type DoctorAppointmentSummary,
  doctorCabinetKeys,
  getAppointmentSummary,
  getDoctorAppointments,
  updateAppointmentSummary,
} from "@/shared/api";
import { extractErrorMessage } from "@/shared/lib/errors";
import { Button, Textarea } from "@/shared/ui";
import { SegmentedControl } from "@/shared/ui/segmented-control";

type Tab = "all" | "upcoming" | "completed";

const TABS = [
  { value: "all" as const, label: "Все" },
  { value: "upcoming" as const, label: "Предстоящие" },
  { value: "completed" as const, label: "Завершенные" },
];

// Плашка статуса записи (как в макете): предстоящая — оранжевая, завершённая —
// зелёная, отменённая — серая.
const STATUS_PILL: Record<
  DoctorAppointment["status"],
  { label: string; cls: string }
> = {
  upcoming: { label: "Предстоящая", cls: "bg-primary-tint text-primary" },
  completed: { label: "Завершенная", cls: "bg-[#E3F5EC] text-[#2FA968]" },
  cancelled: { label: "Отменена", cls: "bg-surface text-muted" },
};

// "2026-05-06" → "06.05.2026".
const fmtDate = (iso: string): string => {
  const parts = iso?.split("-");
  if (parts?.length === 3) return `${parts[2]}.${parts[1]}.${parts[0]}`;
  return iso;
};

// "10:00:00" → "10:00".
const fmtTime = (time: string): string =>
  time?.length >= 5 ? time.slice(0, 5) : time;

const EMPTY_SUMMARY: DoctorAppointmentSummary = {
  diagnosis: "",
  recommendations: "",
  doctor_notes: "",
};

// Раскрывающийся редактор итогов приёма под строкой записи.
const SummaryEditor: FC<{ appointmentId: number }> = ({ appointmentId }) => {
  const queryClient = useQueryClient();
  const queryKey = [
    ...doctorCabinetKeys.all,
    "appointment-summary",
    appointmentId,
  ];

  const { data, isLoading } = useQuery({
    queryKey,
    queryFn: () => getAppointmentSummary(appointmentId),
  });

  const [form, setForm] = useState<DoctorAppointmentSummary | null>(null);
  const [synced, setSynced] = useState<DoctorAppointmentSummary | undefined>(
    undefined,
  );
  if (data && data !== synced) {
    setSynced(data);
    setForm({ ...EMPTY_SUMMARY, ...data });
  }

  const { mutate: save, isPending } = useMutation({
    mutationFn: (body: DoctorAppointmentSummary) =>
      updateAppointmentSummary(appointmentId, body),
    onSuccess: (updated) => {
      queryClient.setQueryData(queryKey, updated);
      toast.success("Итоги сохранены");
    },
    onError: (err: unknown) => {
      const errData = (err as { response?: { data?: unknown } })?.response
        ?.data;
      toast.error(extractErrorMessage(errData, "Не удалось сохранить итоги"));
    },
  });

  if (isLoading || !form) {
    return (
      <div className="px-6 py-4 bg-surface text-muted text-sm">Загрузка...</div>
    );
  }

  const set = (key: keyof DoctorAppointmentSummary, value: string) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  return (
    <div className="px-6 py-4 bg-surface flex flex-col gap-3">
      <Textarea
        label="Диагноз"
        value={form.diagnosis}
        onChange={(e) => set("diagnosis", e.target.value)}
        placeholder="Диагноз по итогам приёма"
        rows={2}
      />
      <Textarea
        label="Рекомендации"
        value={form.recommendations}
        onChange={(e) => set("recommendations", e.target.value)}
        placeholder="Рекомендации пациенту"
        rows={2}
      />
      <Textarea
        label="Заметки врача (не видны пациенту)"
        value={form.doctor_notes}
        onChange={(e) => set("doctor_notes", e.target.value)}
        placeholder="Внутренние заметки"
        rows={2}
      />
      <div className="flex justify-end">
        <Button size="sm" disabled={isPending} onClick={() => save(form)}>
          {isPending ? "Сохранение..." : "Сохранить итоги"}
        </Button>
      </div>
    </div>
  );
};

const StatusPill: FC<{ status: DoctorAppointment["status"] }> = ({
  status,
}) => {
  const { label, cls } = STATUS_PILL[status] ?? STATUS_PILL.cancelled;
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${cls}`}
    >
      {label}
    </span>
  );
};

export const DoctorAppointmentsPage: FC = () => {
  const [tab, setTab] = useState<Tab>("all");
  const [openSummaryId, setOpenSummaryId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: doctorCabinetKeys.appointments({ status: tab }),
    queryFn: () => getDoctorAppointments(tab === "all" ? {} : { status: tab }),
  });

  const appointments = data?.data ?? [];

  const toggle = (id: number) =>
    setOpenSummaryId((cur) => (cur === id ? null : id));

  return (
    <DoctorPageLayout title="Записи">
      {/* Desktop: заголовок + сегмент-переключатель в одну строку */}
      <div className="hidden lg:flex items-center justify-between mb-6">
        <h2 className="text-[32px] font-semibold text-foreground">Записи</h2>
        <div className="w-90 shrink-0">
          <SegmentedControl options={TABS} value={tab} onChange={setTab} />
        </div>
      </div>

      {/* Mobile: сегмент под шапкой страницы */}
      <div className="lg:hidden mb-4">
        <SegmentedControl options={TABS} value={tab} onChange={setTab} />
      </div>

      {isLoading ? (
        <div className="bg-white rounded-3xl border border-border px-6 py-16 text-center text-muted text-sm">
          Загрузка...
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-3xl border border-border px-6 py-16 text-center text-muted text-sm">
          Нет записей
        </div>
      ) : (
        <>
          {/* ── Desktop: таблица ───────────────────────────────── */}
          <div className="hidden md:block bg-white rounded-3xl border border-border overflow-hidden">
            <div className="grid grid-cols-[1.6fr_1fr_0.8fr_1.2fr_1fr] gap-4 px-6 py-4 border-b border-border">
              <span className="text-muted text-sm">Пациент</span>
              <span className="text-muted text-sm">Дата</span>
              <span className="text-muted text-sm">Время</span>
              <span className="text-muted text-sm">Тип</span>
              <span className="text-muted text-sm">Статус</span>
            </div>

            {appointments.map((a, i) => (
              <div
                key={a.id}
                className={
                  i !== appointments.length - 1 ? "border-b border-border" : ""
                }
              >
                <div
                  onClick={() => toggle(a.id)}
                  className="grid grid-cols-[1.6fr_1fr_0.8fr_1.2fr_1fr] gap-4 px-6 py-4 items-center cursor-pointer hover:bg-surface transition-colors"
                >
                  <span className="text-foreground font-medium">
                    {a.patient.full_name}
                  </span>
                  <span className="text-foreground">{fmtDate(a.date)}</span>
                  <span className="text-foreground">{fmtTime(a.time)}</span>
                  <span className="text-foreground">
                    {a.service?.name ?? "—"}
                  </span>
                  <span>
                    <StatusPill status={a.status} />
                  </span>
                </div>
                {openSummaryId === a.id && (
                  <SummaryEditor appointmentId={a.id} />
                )}
              </div>
            ))}
          </div>

          {/* ── Mobile: карточки ───────────────────────────────── */}
          <div className="md:hidden flex flex-col gap-3">
            {appointments.map((a) => (
              <div
                key={a.id}
                className="bg-white rounded-2xl border border-border overflow-hidden"
              >
                <div
                  onClick={() => toggle(a.id)}
                  className="p-4 cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-foreground font-medium">
                      {a.patient.full_name}
                    </span>
                    <StatusPill status={a.status} />
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-muted">
                    <span>{fmtDate(a.date)}</span>
                    <span>{fmtTime(a.time)}</span>
                    {a.service?.name && (
                      <span className="text-foreground">{a.service.name}</span>
                    )}
                  </div>
                </div>
                {openSummaryId === a.id && (
                  <SummaryEditor appointmentId={a.id} />
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </DoctorPageLayout>
  );
};
