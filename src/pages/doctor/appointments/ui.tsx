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
import { Button, Modal, Textarea } from "@/shared/ui";
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

// Форма итогов приёма — открывается в модалке/боттом-шите по клику на запись.
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
    return <div className="py-6 text-muted text-sm">Загрузка...</div>;
  }

  const set = (key: keyof DoctorAppointmentSummary, value: string) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  return (
    <div className="flex flex-col gap-3">
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
  const [summaryId, setSummaryId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: doctorCabinetKeys.appointments({ status: tab }),
    queryFn: () => getDoctorAppointments(tab === "all" ? {} : { status: tab }),
  });

  const appointments = data?.data ?? [];
  const th = "px-6 py-4 text-muted text-sm font-normal whitespace-nowrap";
  const td = "px-6 py-4 whitespace-nowrap";

  return (
    <DoctorPageLayout title="Записи">
      {/* Десктоп: заголовок + сегмент-переключатель в одну строку */}
      <div className="hidden lg:flex items-center justify-between mb-6">
        <h2 className="text-[32px] font-semibold text-foreground">Записи</h2>
        <div className="w-90 shrink-0">
          <SegmentedControl options={TABS} value={tab} onChange={setTab} />
        </div>
      </div>

      {/* Мобайл: сегмент под шапкой страницы */}
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
        <div className="bg-white rounded-3xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-160 text-left border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className={th}>Пациент</th>
                  <th className={th}>Дата</th>
                  <th className={th}>Время</th>
                  <th className={th}>Тип</th>
                  <th className={th}>Статус</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => (
                  <tr
                    key={a.id}
                    onClick={() => setSummaryId(a.id)}
                    className="border-b border-border last:border-0 cursor-pointer hover:bg-surface transition-colors"
                  >
                    <td className={`${td} text-foreground font-medium`}>
                      {a.patient.full_name}
                    </td>
                    <td className={`${td} text-foreground`}>
                      {fmtDate(a.date)}
                    </td>
                    <td className={`${td} text-foreground`}>
                      {fmtTime(a.time)}
                    </td>
                    <td className={`${td} text-foreground`}>
                      {a.service?.name ?? "—"}
                    </td>
                    <td className={td}>
                      <StatusPill status={a.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={summaryId !== null}
        onClose={() => setSummaryId(null)}
        title="Итоги приёма"
      >
        {summaryId !== null && <SummaryEditor appointmentId={summaryId} />}
      </Modal>
    </DoctorPageLayout>
  );
};
