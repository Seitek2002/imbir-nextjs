"use client";

import { FC, useState } from "react";
import toast from "react-hot-toast";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { DoctorPageLayout } from "@/widgets/doctor/layout";

import {
  type DoctorAppointmentSummary,
  doctorCabinetKeys,
  getAppointmentSummary,
  getDoctorAppointments,
  updateAppointmentSummary,
} from "@/shared/api";
import { extractErrorMessage } from "@/shared/lib/errors";
import { Button, Textarea } from "@/shared/ui";

type Tab = "all" | "upcoming" | "completed" | "cancelled";

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "Все" },
  { key: "upcoming", label: "Предстоящие" },
  { key: "completed", label: "Завершённые" },
  { key: "cancelled", label: "Отменённые" },
];

const STATUS_LABEL: Record<Tab, string> = {
  all: "",
  upcoming: "Предстоит",
  completed: "Завершён",
  cancelled: "Отменён",
};

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
      <div className="px-5 py-4 bg-surface text-muted text-sm">Загрузка...</div>
    );
  }

  const set = (key: keyof DoctorAppointmentSummary, value: string) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  return (
    <div className="px-5 py-4 bg-surface flex flex-col gap-3">
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

export const DoctorAppointmentsPage: FC = () => {
  const [tab, setTab] = useState<Tab>("all");
  const [openSummaryId, setOpenSummaryId] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: doctorCabinetKeys.appointments({ status: tab }),
    queryFn: () => getDoctorAppointments(tab === "all" ? {} : { status: tab }),
  });

  const appointments = data?.data ?? [];

  return (
    <DoctorPageLayout title="Записи">
      <h2 className="text-[28px] font-semibold text-foreground mb-6 hidden lg:block">
        Записи
      </h2>

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
        <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 px-5 py-3 border-b border-border">
          <span className="text-muted text-sm font-medium">Пациент</span>
          <span className="text-muted text-sm font-medium">Дата / Время</span>
          <span className="text-muted text-sm font-medium">Статус</span>
          <span className="text-muted text-sm font-medium">Итоги</span>
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
              className={
                i !== appointments.length - 1 ? "border-b border-border" : ""
              }
            >
              <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2 px-5 py-4 items-center">
                <span className="text-foreground text-sm font-medium">
                  {a.patient.full_name}
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
                  {STATUS_LABEL[a.status as Tab] ?? a.status}
                </span>
                <button
                  onClick={() =>
                    setOpenSummaryId(openSummaryId === a.id ? null : a.id)
                  }
                  className="text-primary text-sm font-medium hover:underline whitespace-nowrap"
                >
                  {openSummaryId === a.id ? "Скрыть" : "Итоги приёма"}
                </button>
              </div>
              {openSummaryId === a.id && <SummaryEditor appointmentId={a.id} />}
            </div>
          ))
        )}
      </div>
    </DoctorPageLayout>
  );
};
