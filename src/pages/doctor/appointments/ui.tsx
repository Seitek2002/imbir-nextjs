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
  profileKeys,
  updateAppointmentStatus,
  updateAppointmentSummary,
} from "@/shared/api";
import { fmtDate, fmtTime } from "@/shared/lib/datetime";
import { extractErrorMessage } from "@/shared/lib/errors";
import { Button, Modal, Textarea } from "@/shared/ui";
import { SegmentedControl } from "@/shared/ui/segmented-control";

const TH = "px-6 py-4 text-muted text-sm font-normal whitespace-nowrap";
const TD = "px-6 py-4 whitespace-nowrap";
// Полоса слева у новой записи — именно тень, а не border: у таблицы
// border-collapse, и рамка крайней ячейки схлопывается с краем таблицы и не
// отрисовывается (проверено: вычисленный стиль был правильный, пикселей не было).
// Тень рисуется внутри ячейки и не занимает места, так что колонки не съезжают.
const TD_NEW = "shadow-[inset_4px_0_0_0_var(--color-info)]";

// Заглушка повторяет саму таблицу записей — та же шапка и колонки, чтобы при
// появлении данных ничего не прыгало.
const AppointmentsSkeleton: FC = () => (
  <div className="bg-white rounded-3xl border border-border overflow-hidden">
    <div className="overflow-x-auto">
      <table className="w-full min-w-160 text-left border-collapse">
        <thead>
          <tr className="border-b border-border">
            <th className={TH}>Пациент</th>
            <th className={TH}>Дата</th>
            <th className={TH}>Время</th>
            <th className={TH}>Тип</th>
            <th className={TH}>Статус</th>
            <th className={TH}>Действия</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i} className="border-b border-border last:border-0">
              <td className={TD}>
                <div className="h-4 w-40 rounded-md skeleton" />
              </td>
              <td className={TD}>
                <div className="h-4 w-24 rounded-md skeleton" />
              </td>
              <td className={TD}>
                <div className="h-4 w-14 rounded-md skeleton" />
              </td>
              <td className={TD}>
                <div className="h-4 w-32 rounded-md skeleton" />
              </td>
              <td className={TD}>
                <div className="h-6 w-28 rounded-full skeleton" />
              </td>
              <td className={TD}>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-24 rounded-full skeleton" />
                  <div className="h-8 w-24 rounded-full skeleton" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

// Итоги приёма грузятся в модалке — скелетон под три поля (диагноз,
// рекомендации, заметки) и кнопку сохранения справа.
const SummarySkeleton: FC = () => (
  <div className="flex flex-col gap-3">
    {/* Ширины подписей заданы литералами: Tailwind не генерирует классы,
        собранные интерполяцией строк. */}
    {["w-20", "w-28", "w-44"].map((w) => (
      <div key={w} className="flex flex-col gap-1.5">
        <div className={`h-3.5 rounded-md skeleton ${w}`} />
        <div className="h-16 w-full rounded-2xl skeleton" />
      </div>
    ))}
    <div className="flex justify-end">
      <div className="h-9 w-36 rounded-full skeleton" />
    </div>
  </div>
);

type Tab = "all" | "completed" | "upcoming";

// Пустой список объясняем в терминах выбранной вкладки: «Нет записей» под
// фильтром «Завершённые» читалось как «пациентов нет вообще».
const EMPTY_TEXT: Record<Tab, string> = {
  all: "Записей пока нет. Они появятся здесь, как только пациенты запишутся к вам на приём.",
  upcoming:
    "Предстоящих приёмов нет. Здесь будут записи, которые ещё не состоялись.",
  completed: "Завершённых приёмов пока нет.",
};

const TABS = [
  { value: "all" as const, label: "Все" },
  { value: "upcoming" as const, label: "Предстоящие" },
  { value: "completed" as const, label: "Завершенные" },
];

const STATUS_PILL: Record<
  DoctorAppointment["status"],
  { cls: string; label: string }
> = {
  // Синий закреплён за «ждёт реакции» и больше ни за чем: раньше им была
  // помечена подтверждённая запись — то есть ровно та, с которой делать уже ничего не надо.
  pending: { label: "Новая", cls: "bg-info-tint text-info" },
  upcoming: { label: "Предстоящая", cls: "bg-primary-tint text-primary" },
  confirmed: { label: "Подтверждена", cls: "bg-primary-tint text-primary" },
  scheduled: { label: "Подтверждена", cls: "bg-primary-tint text-primary" },
  completed: { label: "Завершенная", cls: "bg-[#E3F5EC] text-[#2FA968]" },
  cancelled: { label: "Отменена", cls: "bg-surface text-muted" },
};

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
    return <SummarySkeleton />;
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
  const [summaryId, setSummaryId] = useState<null | number>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: doctorCabinetKeys.appointments({ status: tab }),
    queryFn: () => getDoctorAppointments(tab === "all" ? {} : { status: tab }),
  });

  const { mutate: changeStatus } = useMutation({
    mutationFn: (vars: {
      id: number;
      status: "cancelled" | "completed" | "confirmed";
    }) => updateAppointmentStatus(vars.id, vars.status),
    onSuccess: (_, vars) => {
      toast.success("Статус записи обновлён");
      queryClient.invalidateQueries({ queryKey: doctorCabinetKeys.all });
      queryClient.invalidateQueries({ queryKey: profileKeys.all });
      if (vars.status === "cancelled") {
        queryClient.invalidateQueries({ queryKey: ["record-available-slots"] });
        queryClient.invalidateQueries({
          queryKey: ["reschedule-available-slots"],
        });
      }
    },
    onError: (err: unknown) => {
      const errData = (err as { response?: { data?: unknown } })?.response
        ?.data;
      toast.error(extractErrorMessage(errData, "Не удалось изменить статус"));
    },
  });

  const appointments = data?.data ?? [];

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
        <AppointmentsSkeleton />
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-3xl border border-border px-6 py-16 flex flex-col items-center gap-2 text-center">
          <p className="text-foreground font-medium">
            {tab === "all" ? "Записей пока нет" : "В этой вкладке пусто"}
          </p>
          <p className="text-muted text-sm max-w-80">{EMPTY_TEXT[tab]}</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-160 text-left border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className={TH}>Пациент</th>
                  <th className={TH}>Дата</th>
                  <th className={TH}>Время</th>
                  <th className={TH}>Тип</th>
                  <th className={TH}>Статус</th>
                  <th className={TH}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((a) => {
                  const canConfirm = a.status === "pending";
                  const canComplete =
                    a.status === "pending" ||
                    a.status === "confirmed" ||
                    a.status === "scheduled" ||
                    a.status === "upcoming";
                  const canCancel =
                    a.status === "pending" ||
                    a.status === "confirmed" ||
                    a.status === "scheduled" ||
                    a.status === "upcoming";

                  // Новая запись — та, что ещё ждёт подтверждения врача.
                  const isNew = a.status === "pending";

                  return (
                    <tr
                      key={a.id}
                      className={`border-b border-border last:border-0 transition-colors ${
                        isNew ? "bg-info-tint" : "hover:bg-surface"
                      }`}
                    >
                      <td
                        onClick={() => setSummaryId(a.id)}
                        className={`${TD} text-foreground font-medium cursor-pointer ${
                          // Полоса слева вместо рамки вокруг строки: у таблицы
                          // border-collapse, и рамка на <tr> схлопывается с разделителями
                          // ячеек. На первой ячейке она рисуется предсказуемо.
                          isNew ? TD_NEW : ""
                        }`}
                      >
                        {a.patient.full_name}
                      </td>
                      <td
                        onClick={() => setSummaryId(a.id)}
                        className={`${TD} text-foreground cursor-pointer`}
                      >
                        {fmtDate(a.date)}
                      </td>
                      <td
                        onClick={() => setSummaryId(a.id)}
                        className={`${TD} text-foreground cursor-pointer`}
                      >
                        {fmtTime(a.time)}
                      </td>
                      <td
                        onClick={() => setSummaryId(a.id)}
                        className={`${TD} text-foreground cursor-pointer`}
                      >
                        {a.service?.name ?? "—"}
                      </td>
                      <td className={TD}>
                        <StatusPill status={a.status} />
                      </td>
                      <td className={TD}>
                        <div className="flex items-center gap-1.5">
                          {canConfirm && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs px-2.5 h-8 border-primary text-primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                changeStatus({ id: a.id, status: "confirmed" });
                              }}
                            >
                              Подтвердить
                            </Button>
                          )}
                          {canComplete && (
                            <Button
                              size="sm"
                              className="text-xs px-2.5 h-8 bg-[#2FA968] hover:bg-[#258753]"
                              onClick={(e) => {
                                e.stopPropagation();
                                changeStatus({ id: a.id, status: "completed" });
                              }}
                            >
                              Завершить
                            </Button>
                          )}
                          {canCancel && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs px-2.5 h-8 border-red-200 text-red-500 hover:bg-red-50"
                              onClick={(e) => {
                                e.stopPropagation();
                                changeStatus({ id: a.id, status: "cancelled" });
                              }}
                            >
                              Отменить
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
