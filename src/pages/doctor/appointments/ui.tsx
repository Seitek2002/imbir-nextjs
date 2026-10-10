"use client";

import { FC, useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

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
import { cn } from "@/shared/lib/utils";
import {
  Button,
  ConfirmDialog,
  Modal,
  Textarea,
  ViewModeToggle,
  useListView,
} from "@/shared/ui";
import { SegmentedControl } from "@/shared/ui/segmented-control";

const TH = "px-6 py-4 text-muted text-sm font-normal whitespace-nowrap";
const TD = "px-6 py-4 whitespace-nowrap";
// Полоса слева у новой записи — именно тень, а не border: у таблицы
// border-collapse, и рамка крайней ячейки схлопывается с краем таблицы и не
// отрисовывается (проверено: вычисленный стиль был правильный, пикселей не было).
// Тень рисуется внутри ячейки и не занимает места, так что колонки не съезжают.
const TD_NEW = "shadow-[inset_4px_0_0_0_var(--color-info)]";

// Завершить можно только начавшийся приём: бэк завершение будущей записи
// отклоняет, а пациенту иначе уходило «Приём завершён, оставьте отзыв» до визита.
// Не разобрали дату — кнопку не прячем, решит бэк.
const hasStarted = (a: DoctorAppointment, now: number) => {
  const start = new Date(`${a.date}T${a.time.slice(0, 5)}:00`).getTime();
  return Number.isNaN(start) || start <= now;
};

// Текущее время, раз в минуту обновляемое: страница записей висит открытой
// весь рабочий день, и «Завершить» должно появиться, когда приём начался.
const useNow = (intervalMs = 60_000) => {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
};

// Формат и место приёма. Старый бэк is_online/clinic может не отдавать —
// тогда строку не рисуем, а не пишем «В клинике» наугад.
const formatLabel = (a: DoctorAppointment): null | string => {
  const parts: string[] = [];
  if (a.is_online !== undefined) parts.push(a.is_online ? "Онлайн" : "Очно");
  if (a.clinic?.name) parts.push(a.clinic.name);
  return parts.length > 0 ? parts.join(" • ") : null;
};

// Телефон и почта пациента (у гостя — те, что он оставил при записи): врачу
// иначе не с кем связаться, если пациент не пришёл или надо перенести приём.
// Клик по ссылке не должен открывать итоги приёма, как клик по строке.
const PatientContacts: FC<{ patient: DoctorAppointment["patient"] }> = ({
  patient,
}) => {
  if (!patient.phone && !patient.email) return null;
  return (
    <p className="text-xs text-muted mt-0.5 font-normal flex flex-wrap gap-x-2">
      {patient.phone && (
        <a
          href={`tel:${patient.phone.replace(/[^\d+]/g, "")}`}
          onClick={(e) => e.stopPropagation()}
          className="hover:text-primary"
        >
          {patient.phone}
        </a>
      )}
      {patient.email && (
        <a
          href={`mailto:${patient.email}`}
          onClick={(e) => e.stopPropagation()}
          className="hover:text-primary"
        >
          {patient.email}
        </a>
      )}
    </p>
  );
};

// Комментарий, который пациент оставил при записи.
const PatientNotes: FC<{ className?: string; notes?: string }> = ({
  className,
  notes,
}) => {
  if (!notes?.trim()) return null;
  return (
    <p className={cn("text-xs text-muted mt-1", className)} title={notes}>
      <span className="text-foreground">Комментарий пациента:</span> {notes}
    </p>
  );
};

// Заглушка повторяет саму таблицу записей — та же шапка и колонки, чтобы при
// появлении данных ничего не прыгало.
// Мобильная карточка записи. Таблица на 390px показывала только имя
// пациента: дата, время, услуга, статус и кнопки действий уходили за правый
// край — подтвердить или отменить приём с телефона было нельзя, не найдя
// горизонтальный скролл внутри блока.
const AppointmentCard: FC<{
  appointment: DoctorAppointment;
  onChangeStatus: (status: AppointmentStatusAction) => void;
  onOpenSummary: (id: number) => void;
  started: boolean;
}> = ({ appointment: a, onChangeStatus, onOpenSummary, started }) => {
  const isNew = a.status === "pending";
  const isOpen =
    a.status === "pending" ||
    a.status === "confirmed" ||
    a.status === "scheduled" ||
    a.status === "upcoming";
  const format = formatLabel(a);

  return (
    <div
      className={`bg-white rounded-2xl border p-3 ${
        isNew ? "border-info" : "border-border"
      }`}
    >
      <button
        type="button"
        onClick={() => onOpenSummary(a.id)}
        className="w-full text-left"
      >
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-foreground">
            {a.patient.full_name}
          </p>
          <StatusPill status={a.status} />
        </div>
        <p className="text-xs text-muted mt-1">
          {fmtDate(a.date)} • {fmtTime(a.time)}
        </p>
        <p className="text-xs text-muted mt-0.5">{a.service?.name ?? "—"}</p>
        {format && <p className="text-xs text-muted mt-0.5">{format}</p>}
      </button>

      {/* Ссылки — вне кнопки карточки: <a> внутри <button> недопустим. */}
      <PatientContacts patient={a.patient} />
      <PatientNotes notes={a.notes} className="whitespace-pre-line" />

      {isOpen && (
        <div className="flex flex-wrap items-center gap-1.5 mt-3">
          {isNew && (
            <Button
              size="sm"
              variant="outline"
              className="text-xs px-2.5 h-8 border-primary text-primary"
              onClick={() => onChangeStatus("confirmed")}
            >
              Подтвердить
            </Button>
          )}
          {started && (
            <Button
              size="sm"
              className="text-xs px-2.5 h-8 bg-[#2FA968] hover:bg-[#258753]"
              onClick={() => onChangeStatus("completed")}
            >
              Завершить
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            className="text-xs px-2.5 h-8 border-red-200 text-red-500 hover:bg-red-50"
            onClick={() => onChangeStatus("cancelled")}
          >
            Отменить
          </Button>
        </div>
      )}
    </div>
  );
};

// Заглушка мобильного списка — те же карточки, чтобы ничего не прыгало.
const AppointmentsMobileSkeleton: FC<{ className?: string }> = ({
  className,
}) => (
  <div className={cn("flex flex-col gap-3", className)}>
    {Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="bg-white rounded-2xl border border-border p-3">
        <div className="h-4 w-40 rounded-md skeleton" />
        <div className="h-3 w-28 rounded-md skeleton mt-2" />
        <div className="h-3 w-24 rounded-md skeleton mt-2" />
      </div>
    ))}
  </div>
);

const AppointmentsSkeleton: FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn(
      "bg-white rounded-3xl border border-border overflow-hidden",
      className,
    )}
  >
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

// Список записей переопрашиваем раз в минуту, как и счётчик новых записей в
// сайдбаре: иначе бейдж и звук сообщали о записи, которой в открытом списке нет.
const LIST_POLL_MS = 60_000;

type AppointmentStatusAction = "cancelled" | "completed" | "confirmed";

// Отмена и завершение необратимы (из cancelled/completed бэк дальше не
// переводит), и пациенту сразу уходит уведомление — поэтому перед ними
// спрашиваем подтверждение. Маленькие кнопки стоят вплотную, и на телефоне
// вместо «Подтвердить» легко попасть в «Отменить».
const CONFIRM_TEXT: Record<
  Exclude<AppointmentStatusAction, "confirmed">,
  {
    cancelLabel: string;
    confirmLabel: string;
    description: string;
    title: string;
  }
> = {
  cancelled: {
    title: "Отменить запись?",
    description:
      "Пациент получит уведомление об отмене, время освободится для других. Вернуть запись будет нельзя — пациенту придётся записаться заново.",
    confirmLabel: "Отменить запись",
    cancelLabel: "Не отменять",
  },
  completed: {
    title: "Завершить приём?",
    description:
      "Пациент получит уведомление о завершении приёма и просьбу оставить отзыв. Изменить статус потом будет нельзя.",
    confirmLabel: "Завершить",
    cancelLabel: "Отмена",
  },
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
  const now = useNow();

  // Страницы по 100, новые записи первыми; дальше — «Показать ещё». Старый бэк
  // без серверной сортировки отдаёт всё одной «страницей» (см.
  // fetchAppointmentsNewestFirst), и кнопки догрузки тогда нет.
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: doctorCabinetKeys.appointments({ status: tab }),
      queryFn: ({ pageParam }) =>
        getDoctorAppointments({
          ...(tab === "all" ? {} : { status: tab }),
          ...(pageParam > 1 ? { page: pageParam } : {}),
        }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.pagination &&
        lastPage.pagination.page < lastPage.pagination.total_pages
          ? lastPage.pagination.page + 1
          : undefined,
      refetchInterval: LIST_POLL_MS,
    });

  // Запись, по которой ждём подтверждения отмены/завершения.
  const [confirmAction, setConfirmAction] = useState<{
    appointment: DoctorAppointment;
    status: Exclude<AppointmentStatusAction, "confirmed">;
  } | null>(null);

  const { mutate: changeStatus } = useMutation({
    mutationFn: (vars: { id: number; status: AppointmentStatusAction }) =>
      updateAppointmentStatus(vars.id, vars.status),
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

  // Между страницами запись могла сдвинуться (пришла новая) — убираем повторы.
  const seen = new Set<number>();
  const appointments = (data?.pages.flatMap((page) => page.data) ?? []).filter(
    (item) => !seen.has(item.id) && seen.add(item.id),
  );

  // «Подтвердить» — сразу, отмена и завершение — через диалог.
  const requestStatus = (
    appointment: DoctorAppointment,
    status: AppointmentStatusAction,
  ) => {
    if (status === "confirmed") {
      changeStatus({ id: appointment.id, status });
    } else {
      setConfirmAction({ appointment, status });
    }
  };

  const {
    mode: viewMode,
    setMode: setViewMode,
    cardsClassName,
    tableClassName,
  } = useListView();

  return (
    <DoctorPageLayout title="Записи">
      {/* Десктоп: заголовок + фильтр по статусу + вид списка в одну строку */}
      <div className="hidden lg:flex items-center justify-between gap-3 mb-6">
        <h2 className="text-[32px] font-semibold text-foreground">Записи</h2>
        <div className="flex items-center gap-3">
          <div className="w-90 shrink-0">
            <SegmentedControl options={TABS} value={tab} onChange={setTab} />
          </div>
          <ViewModeToggle mode={viewMode} onChange={setViewMode} />
        </div>
      </div>

      {/* Мобайл: сегмент под шапкой страницы, вид списка — под ним. В одну
          строку они не помещаются: сегмент делит ширину поровну между тремя
          вкладками, и на 390px «Предстоящие» с «Завершенными» слипались. */}
      <div className="lg:hidden flex flex-col gap-3 mb-4 sm:flex-row sm:items-center">
        <div className="sm:flex-1 sm:min-w-0">
          <SegmentedControl options={TABS} value={tab} onChange={setTab} />
        </div>
        <div className="flex justify-end">
          <ViewModeToggle mode={viewMode} onChange={setViewMode} />
        </div>
      </div>

      {isLoading ? (
        <>
          <AppointmentsMobileSkeleton className={cardsClassName} />
          <AppointmentsSkeleton className={tableClassName} />
        </>
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-3xl border border-border px-6 py-16 flex flex-col items-center gap-2 text-center">
          <p className="text-foreground font-medium">
            {tab === "all" ? "Записей пока нет" : "В этой вкладке пусто"}
          </p>
          <p className="text-muted text-sm max-w-80">{EMPTY_TEXT[tab]}</p>
        </div>
      ) : (
        <>
          <div className={cn("flex flex-col gap-3", cardsClassName)}>
            {appointments.map((a) => (
              <AppointmentCard
                key={a.id}
                appointment={a}
                onChangeStatus={(status) => requestStatus(a, status)}
                onOpenSummary={setSummaryId}
                started={hasStarted(a, now)}
              />
            ))}
          </div>

          <div
            className={cn(
              "bg-white rounded-3xl border border-border overflow-hidden",
              tableClassName,
            )}
          >
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
                      (a.status === "pending" ||
                        a.status === "confirmed" ||
                        a.status === "scheduled" ||
                        a.status === "upcoming") &&
                      hasStarted(a, now);
                    const format = formatLabel(a);
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
                          <PatientContacts patient={a.patient} />
                          <PatientNotes
                            notes={a.notes}
                            className="font-normal max-w-64 truncate"
                          />
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
                          {format && (
                            <p className="text-xs text-muted mt-0.5">
                              {format}
                            </p>
                          )}
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
                                  changeStatus({
                                    id: a.id,
                                    status: "confirmed",
                                  });
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
                                  requestStatus(a, "completed");
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
                                  requestStatus(a, "cancelled");
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

          {hasNextPage && (
            <div className="flex justify-center mt-4">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                loading={isFetchingNextPage}
              >
                {isFetchingNextPage ? "Загрузка…" : "Показать ещё"}
              </Button>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={confirmAction !== null}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => {
          if (confirmAction) {
            changeStatus({
              id: confirmAction.appointment.id,
              status: confirmAction.status,
            });
          }
        }}
        title={confirmAction ? CONFIRM_TEXT[confirmAction.status].title : ""}
        description={
          confirmAction
            ? `${confirmAction.appointment.patient.full_name}, ${fmtDate(
                confirmAction.appointment.date,
              )} в ${fmtTime(confirmAction.appointment.time)}. ${
                CONFIRM_TEXT[confirmAction.status].description
              }`
            : undefined
        }
        confirmLabel={
          confirmAction ? CONFIRM_TEXT[confirmAction.status].confirmLabel : ""
        }
        cancelLabel={
          confirmAction ? CONFIRM_TEXT[confirmAction.status].cancelLabel : ""
        }
        variant={confirmAction?.status === "cancelled" ? "danger" : "default"}
      />

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
