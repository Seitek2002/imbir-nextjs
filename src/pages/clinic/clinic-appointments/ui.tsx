"use client";

import { FC, useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { ClinicPageLayout } from "@/widgets/clinic/layout";

import {
  type ClinicAppointment,
  clinicCabinetKeys,
  getClinicAppointmentsNewestFirst,
  profileKeys,
  updateAppointmentStatus,
} from "@/shared/api";
import { fmtDate, fmtTime } from "@/shared/lib/datetime";
import { extractErrorMessage } from "@/shared/lib/errors";
import { cn } from "@/shared/lib/utils";
import {
  Button,
  ConfirmDialog,
  ViewModeToggle,
  useListView,
} from "@/shared/ui";
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

// Список записей переопрашиваем раз в минуту, как и счётчик новых записей в
// сайдбаре: иначе бейдж и звук сообщали о записи, которой в открытом списке нет.
const LIST_POLL_MS = 60_000;

type AppointmentStatusAction = "cancelled" | "completed" | "confirmed";

// Отмена и завершение необратимы (из cancelled/completed бэк дальше не
// переводит), и пациенту сразу уходит уведомление — поэтому перед ними
// спрашиваем подтверждение.
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

// Запись ещё открыта: её можно подтвердить, завершить или отменить.
const isOpenStatus = (status: string) =>
  status === "pending" ||
  status === "confirmed" ||
  status === "scheduled" ||
  status === "upcoming";

// Завершить можно только начавшийся приём: бэк завершение будущей записи
// отклоняет, а пациенту иначе уходило «Приём завершён, оставьте отзыв» до визита.
// Не разобрали дату — кнопку не прячем, решит бэк.
const hasStarted = (a: ClinicAppointment, now: number) => {
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

// Сетка одна на шапку, строки и скелет — иначе колонки расходятся.
// border-l есть у каждой строки, просто обычно прозрачная: иначе у выделенной
// строки колонки съезжают на 4px относительно соседних.
const ROW =
  "grid grid-cols-[1.4fr_1.6fr_1fr_0.8fr_1.6fr] gap-4 px-5 border-l-4";

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
        <div className="h-8 w-40 rounded-full skeleton" />
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

// Ссылка на телефон или почту — чтобы связаться с пациентом или врачом по
// записи (перенос, неявка) прямо из списка.
const ContactLinks: FC<{ email?: null | string; phone?: null | string }> = ({
  email,
  phone,
}) => {
  if (!phone && !email) return null;
  return (
    <span className="text-xs text-muted mt-0.5 font-normal flex flex-wrap gap-x-2">
      {phone && (
        <a
          href={`tel:${phone.replace(/[^\d+]/g, "")}`}
          className="hover:text-primary"
        >
          {phone}
        </a>
      )}
      {email && (
        <a href={`mailto:${email}`} className="hover:text-primary">
          {email}
        </a>
      )}
    </span>
  );
};

// Врач записи и его телефон.
const DoctorLine: FC<{ doctor: ClinicAppointment["doctor"] }> = ({
  doctor,
}) => {
  if (!doctor?.full_name) return null;
  return (
    <span className="text-xs text-muted mt-0.5 flex flex-wrap gap-x-2">
      <span>Врач: {doctor.full_name}</span>
      {doctor.phone && (
        <a
          href={`tel:${doctor.phone.replace(/[^\d+]/g, "")}`}
          className="hover:text-primary"
        >
          {doctor.phone}
        </a>
      )}
    </span>
  );
};

// Кнопки «Подтвердить» / «Завершить» / «Отменить» — одни и те же в карточке
// и в строке таблицы.
const AppointmentActions: FC<{
  appointment: ClinicAppointment;
  onChangeStatus: (status: AppointmentStatusAction) => void;
  started: boolean;
}> = ({ appointment: a, onChangeStatus, started }) => {
  if (!isOpenStatus(a.status)) return null;
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {a.status === "pending" && (
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
  );
};

// Мобильная карточка записи. Раньше здесь скроллилась вбок та же
// четырёхколоночная сетка, что и на десктопе: на 390px было видно имя
// пациента и половину услуги, а статус — ради которого в список и заходят —
// оставался за краем экрана.
const AppointmentCard: FC<{
  appointment: ClinicAppointment;
  onChangeStatus: (status: AppointmentStatusAction) => void;
  started: boolean;
}> = ({ appointment: a, onChangeStatus, started }) => {
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
      <ContactLinks phone={a.patient.phone} email={a.patient.email} />
      <p className="text-xs text-muted mt-1">{a.service?.name ?? "—"}</p>
      <DoctorLine doctor={a.doctor} />
      <p className="text-xs text-muted mt-0.5">
        {fmtDate(a.date)} {fmtTime(a.time)}
      </p>
      {isOpenStatus(a.status) && (
        <div className="mt-3">
          <AppointmentActions
            appointment={a}
            onChangeStatus={onChangeStatus}
            started={started}
          />
        </div>
      )}
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
  const queryClient = useQueryClient();
  const now = useNow();

  // Страницы по 100, новые записи первыми; дальше — «Показать ещё». Старый бэк
  // без серверной сортировки отдаёт всё одной «страницей» (см.
  // fetchAppointmentsNewestFirst), и кнопки догрузки тогда нет.
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: clinicCabinetKeys.appointments({ status: tab }),
      queryFn: ({ pageParam }) =>
        getClinicAppointmentsNewestFirst({
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
    appointment: ClinicAppointment;
    status: Exclude<AppointmentStatusAction, "confirmed">;
  } | null>(null);

  // PATCH /api/appointments/{id}/ клинике разрешён для записей к ней. После
  // ответа перечитываем все запросы кабинета клиники — в том числе счётчик
  // новых записей в сайдбаре, который иначе так и рос бы.
  const { mutate: changeStatus } = useMutation({
    mutationFn: (vars: { id: number; status: AppointmentStatusAction }) =>
      updateAppointmentStatus(vars.id, vars.status),
    onSuccess: (_, vars) => {
      toast.success("Статус записи обновлён");
      queryClient.invalidateQueries({ queryKey: clinicCabinetKeys.all });
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

  // «Подтвердить» — сразу, отмена и завершение — через диалог.
  const requestStatus = (
    appointment: ClinicAppointment,
    status: AppointmentStatusAction,
  ) => {
    if (status === "confirmed") {
      changeStatus({ id: appointment.id, status });
    } else {
      setConfirmAction({ appointment, status });
    }
  };

  // Между страницами запись могла сдвинуться (пришла новая) — убираем повторы.
  // Ответ списка клиники — ClinicAppointmentSerializer, с врачом.
  const seen = new Set<number>();
  const appointments = (
    (data?.pages.flatMap((page) => page.data) ?? []) as ClinicAppointment[]
  ).filter((item) => !seen.has(item.id) && seen.add(item.id));
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
            <AppointmentCard
              key={a.id}
              appointment={a}
              onChangeStatus={(status) => requestStatus(a, status)}
              started={hasStarted(a, now)}
            />
          ))
        )}
      </div>

      <div
        className={cn(
          "bg-white rounded-3xl border border-border overflow-hidden",
          tableClassName,
        )}
      >
        {/* Сетка не влезает в телефон — по умолчанию её заменяют карточки
            выше, но пользователь может выбрать и её. */}
        <div className="overflow-x-auto">
          <div className="min-w-200">
            <div
              className={`${ROW} border-l-transparent py-3 border-b border-border`}
            >
              <span className="text-muted text-sm font-medium">Пациент</span>
              <span className="text-muted text-sm font-medium">Услуга</span>
              <span className="text-muted text-sm font-medium">
                Дата / Время
              </span>
              <span className="text-muted text-sm font-medium">Статус</span>
              <span className="text-muted text-sm font-medium">Действия</span>
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
                    <span className="text-foreground text-sm font-medium flex flex-col">
                      {a.patient.full_name}
                      <ContactLinks
                        phone={a.patient.phone}
                        email={a.patient.email}
                      />
                    </span>
                    <span className="text-muted text-sm flex flex-col">
                      {a.service?.name ?? "—"}
                      <DoctorLine doctor={a.doctor} />
                    </span>
                    <span className="text-muted text-sm whitespace-nowrap">
                      {fmtDate(a.date)} {fmtTime(a.time)}
                    </span>
                    <span
                      className={`text-sm font-medium ${statusColor(a.status)}`}
                    >
                      {STATUS_LABEL[a.status] ?? a.status}
                    </span>
                    <AppointmentActions
                      appointment={a}
                      onChangeStatus={(status) => requestStatus(a, status)}
                      started={hasStarted(a, now)}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Пустое состояние — снаружи широкой сетки: внутри неё текст
            центрировался по всей её ширине и на телефоне обрезался справа. */}
        {!isLoading && appointments.length === 0 && (
          <div className="px-5 py-14 flex flex-col items-center gap-2 text-center">
            <p className="text-foreground font-medium">
              {tab === "all" ? "Записей пока нет" : "В этой вкладке пусто"}
            </p>
            <p className="text-muted text-sm max-w-80">{EMPTY_TEXT[tab]}</p>
          </div>
        )}
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
    </ClinicPageLayout>
  );
};
