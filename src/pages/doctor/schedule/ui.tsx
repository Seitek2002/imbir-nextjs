"use client";

import { FC, useState } from "react";
import toast from "react-hot-toast";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { DoctorPageLayout } from "@/widgets/doctor/layout";

import {
  type DoctorSchedule,
  type WeekSchedule,
  doctorCabinetKeys,
  getDoctorSchedule,
  updateDoctorSchedule,
} from "@/shared/api";
import { extractErrorMessage } from "@/shared/lib/errors";
import { cn } from "@/shared/lib/utils";
import { Button, ConfirmDialog, TimeField } from "@/shared/ui";

const DAYS: { key: keyof WeekSchedule; label: string }[] = [
  { key: "monday", label: "Понедельник" },
  { key: "tuesday", label: "Вторник" },
  { key: "wednesday", label: "Среда" },
  { key: "thursday", label: "Четверг" },
  { key: "friday", label: "Пятница" },
  { key: "saturday", label: "Суббота" },
  { key: "sunday", label: "Воскресенье" },
];

type DayState = { from: string; to: string; enabled: boolean };
type FormState = {
  days: Record<keyof WeekSchedule, DayState>;
  lunchFrom: string;
  lunchTo: string;
  emergency24: boolean;
};

const toFormState = (api: DoctorSchedule): FormState => ({
  days: Object.fromEntries(
    DAYS.map(({ key }) => [
      key,
      {
        from: api.schedule?.[key]?.from ?? "",
        to: api.schedule?.[key]?.to ?? "",
        enabled: api.schedule?.[key]?.enabled ?? false,
      },
    ]),
  ) as FormState["days"],
  lunchFrom: api.lunch_break?.from ?? "",
  lunchTo: api.lunch_break?.to ?? "",
  emergency24: api.emergency_24_7 ?? false,
});

const toApiBody = (form: FormState): DoctorSchedule => ({
  schedule: Object.fromEntries(
    DAYS.map(({ key }) => [
      key,
      {
        from: form.days[key].enabled ? form.days[key].from : "",
        to: form.days[key].enabled ? form.days[key].to : "",
        enabled: form.days[key].enabled,
      },
    ]),
  ) as unknown as WeekSchedule,
  lunch_break: { from: form.lunchFrom, to: form.lunchTo },
  emergency_24_7: form.emergency24,
});

const Toggle: FC<{ on: boolean; onClick: () => void; label?: string }> = ({
  on,
  onClick,
  label,
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={on}
    aria-label={label}
    onClick={onClick}
    className={cn(
      "relative w-11 h-6 rounded-full transition-colors shrink-0",
      on ? "bg-primary" : "bg-border-soft",
    )}
  >
    <span
      className={cn(
        "absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-all duration-200 ease-out",
        on ? "left-[22px]" : "left-0.5",
      )}
    />
  </button>
);

export const DoctorSchedulePage: FC = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: doctorCabinetKeys.schedule(),
    queryFn: getDoctorSchedule,
  });

  // Форма инициализируется из API один раз (adjust-state-during-render).
  const [synced, setSynced] = useState<DoctorSchedule | undefined>(undefined);
  if (data && data !== synced) {
    setSynced(data);
    setForm(toFormState(data));
  }

  const { mutate: save, isPending: isSaving } = useMutation({
    mutationFn: (body: DoctorSchedule) => updateDoctorSchedule(body),
    onSuccess: (updated) => {
      queryClient.setQueryData(doctorCabinetKeys.schedule(), updated);
      toast.success("Расписание сохранено");
    },
    onError: (err: unknown) => {
      const errData = (err as { response?: { data?: unknown } })?.response
        ?.data;
      toast.error(extractErrorMessage(errData, "Не удалось сохранить"));
    },
  });

  const setDay = (key: keyof WeekSchedule, patch: Partial<DayState>) =>
    setForm((prev) =>
      prev
        ? {
            ...prev,
            days: { ...prev.days, [key]: { ...prev.days[key], ...patch } },
          }
        : prev,
    );

  if (isLoading || !form) {
    return (
      <DoctorPageLayout title="Расписание">
        <div className="flex items-center justify-center py-20 text-muted">
          Загрузка...
        </div>
      </DoctorPageLayout>
    );
  }

  return (
    <DoctorPageLayout title="Расписание">
      <div className="hidden lg:flex items-center justify-between mb-6">
        <h2 className="text-[28px] font-semibold text-foreground">
          Расписание приёма
        </h2>
        <Button
          size="sm"
          onClick={() => setConfirmOpen(true)}
          disabled={isSaving}
        >
          {isSaving ? "Сохранение..." : "Сохранить"}
        </Button>
      </div>

      <div className="bg-white rounded-3xl border border-border p-5 lg:p-8 flex flex-col gap-1">
        {DAYS.map(({ key, label }) => {
          const day = form.days[key];
          return (
            <div
              key={key}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 py-3 border-b border-background last:border-0"
            >
              <div className="flex items-center gap-3 shrink-0">
                <Toggle
                  on={day.enabled}
                  onClick={() => setDay(key, { enabled: !day.enabled })}
                  label={label}
                />
                <span
                  className={cn(
                    "text-sm lg:text-base",
                    day.enabled ? "text-foreground" : "text-muted",
                  )}
                >
                  {label}
                </span>
              </div>
              <div className="flex items-center gap-2 pl-14.5 sm:pl-0">
                <TimeField
                  value={day.from}
                  disabled={!day.enabled}
                  onChange={(v) => setDay(key, { from: v })}
                />
                <span className="text-muted">—</span>
                <TimeField
                  value={day.to}
                  disabled={!day.enabled}
                  onChange={(v) => setDay(key, { to: v })}
                />
              </div>
            </div>
          );
        })}

        <div className="flex items-center justify-between gap-3 py-3 border-b border-background">
          <span className="text-sm lg:text-base text-foreground">
            Обеденный перерыв
          </span>
          <div className="flex items-center gap-2">
            <TimeField
              value={form.lunchFrom}
              onChange={(v) => setForm((p) => (p ? { ...p, lunchFrom: v } : p))}
            />
            <span className="text-muted">—</span>
            <TimeField
              value={form.lunchTo}
              onChange={(v) => setForm((p) => (p ? { ...p, lunchTo: v } : p))}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 py-3">
          <span className="text-sm lg:text-base text-foreground">
            Приём 24/7 (экстренный режим)
          </span>
          <Toggle
            on={form.emergency24}
            onClick={() =>
              setForm((p) => (p ? { ...p, emergency24: !p.emergency24 } : p))
            }
            label="Приём 24/7"
          />
        </div>
      </div>

      <div className="lg:hidden mt-4">
        <Button
          size="lg"
          className="w-full"
          onClick={() => setConfirmOpen(true)}
          disabled={isSaving}
        >
          {isSaving ? "Сохранение..." : "Сохранить"}
        </Button>
      </div>

      <p className="text-xs text-muted mt-3">
        Свободные слоты для записи пациентов пересчитываются автоматически по
        этому графику.
      </p>

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          // Диалог закроется сам только после успешного сохранения (см. isLoading/closeOnConfirm).
          save(toApiBody(form), { onSuccess: () => setConfirmOpen(false) });
        }}
        isLoading={isSaving}
        closeOnConfirm={false}
        title="Сохранить изменения?"
        description="Обновлённое расписание приёма будет сохранено, а свободные слоты пересчитаны по нему."
        confirmLabel="Сохранить"
        cancelLabel="Отмена"
      />
    </DoctorPageLayout>
  );
};
