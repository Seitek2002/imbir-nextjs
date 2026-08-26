"use client";

import { FC, useState } from "react";

import { ClinicSectionPage } from "@/widgets/clinic/section-page";

import {
  DAY_API,
  DAY_LABELS,
  type DayKey,
  type DayState,
  TimeChip,
  toDay,
  useClinicCabinet,
} from "@/entities/clinic-profile";

import { Checkbox, TimeField } from "@/shared/ui";

export const ClinicSchedulePage: FC = () => {
  const { profile, isLoading, isSaving, saveProfile } = useClinicCabinet();
  const [isEditing, setIsEditing] = useState(false);

  const [days, setDays] = useState<Record<DayKey, DayState> | null>(null);
  const [lunchStart, setLunchStart] = useState("");
  const [lunchEnd, setLunchEnd] = useState("");
  const [emergency24, setEmergency24] = useState(false);

  const [synced, setSynced] = useState<typeof profile>(null);
  if (profile && profile !== synced) {
    setSynced(profile);
    setDays({
      mon: toDay(profile.workSchedule.mon),
      tue: toDay(profile.workSchedule.tue),
      wed: toDay(profile.workSchedule.wed),
      thu: toDay(profile.workSchedule.thu),
      fri: toDay(profile.workSchedule.fri),
      sat: toDay(profile.workSchedule.sat),
      sun: toDay(profile.workSchedule.sun),
    });
    setLunchStart(profile.workSchedule.lunchStart ?? "");
    setLunchEnd(profile.workSchedule.lunchEnd ?? "");
    setEmergency24(profile.workSchedule.emergency24 ?? false);
  }

  const setDay = (key: DayKey, patch: Partial<DayState>) =>
    setDays((prev) =>
      prev ? { ...prev, [key]: { ...prev[key], ...patch } } : prev,
    );

  const handleSave = async () => {
    if (!days) return;
    await saveProfile({
      schedule: Object.fromEntries(
        DAY_LABELS.map(({ key }) => {
          // По макету отдельного переключателя «Рабочий» нет: день считается
          // рабочим, если заполнено и начало, и конец. Пустые поля = выходной.
          const enabled = !!(days[key].open && days[key].close);
          return [
            DAY_API[key],
            {
              from: enabled ? days[key].open : "",
              to: enabled ? days[key].close : "",
              enabled,
            },
          ];
        }),
      ),
      lunch_break: { from: lunchStart, to: lunchEnd },
      emergency_24_7: emergency24,
    });
    setIsEditing(false);
  };

  if (isLoading || !profile || !days) {
    return (
      <ClinicSectionPage
        title="Расписание"
        isEditing={false}
        onEditToggle={() => {}}
      >
        <div className="flex items-center justify-center py-20 text-muted">
          Загрузка...
        </div>
      </ClinicSectionPage>
    );
  }

  return (
    <ClinicSectionPage
      title="Расписание"
      isEditing={isEditing}
      isSaving={isSaving}
      onEditToggle={() => (isEditing ? handleSave() : setIsEditing(true))}
    >
      <div className="bg-white rounded-3xl border border-border p-5">
        <div className="mb-6">
          {isEditing && (
            <p className="text-sm text-muted mb-4">
              Укажите время работы клиники (с какого времени до какого),
              оставьте поля пустыми в дни, когда клиника не работает.
            </p>
          )}
          <div className="text-sm font-medium text-foreground mb-4">
            График работы
          </div>

          {isEditing ? (
            <div className="flex flex-col gap-3">
              {DAY_LABELS.map(({ key, ru }) => {
                const day = days[key];
                return (
                  <div key={key} className="flex items-center gap-3">
                    <span className="w-8 text-sm text-secondary shrink-0">
                      {ru}
                    </span>
                    <TimeField
                      value={day.open}
                      onChange={(v) => setDay(key, { open: v })}
                    />
                    <span className="text-muted">–</span>
                    <TimeField
                      value={day.close}
                      onChange={(v) => setDay(key, { close: v })}
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {DAY_LABELS.filter(({ key }) => days[key].enabled).map(
                ({ key, ru }) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className="w-8 shrink-0 text-sm text-secondary">
                      {ru}
                    </span>
                    <TimeChip>{days[key].open}</TimeChip>
                    <span className="text-muted">–</span>
                    <TimeChip>{days[key].close}</TimeChip>
                  </div>
                ),
              )}
            </div>
          )}
        </div>

        <div className="mb-6">
          <div className="text-sm font-medium text-foreground mb-3">
            Обеденный перерыв
          </div>
          {isEditing ? (
            <div className="flex items-center gap-3">
              <TimeField value={lunchStart} onChange={setLunchStart} />
              <span className="text-muted">–</span>
              <TimeField value={lunchEnd} onChange={setLunchEnd} />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <TimeChip>{profile.workSchedule.lunchStart}</TimeChip>
              <span className="text-muted">–</span>
              <TimeChip>{profile.workSchedule.lunchEnd}</TimeChip>
            </div>
          )}
        </div>

        {isEditing ? (
          <Checkbox
            size="large"
            label="Экстренный приём 24/7"
            checked={emergency24}
            onChange={(e) => setEmergency24(e.target.checked)}
          />
        ) : (
          profile.workSchedule.emergency24 && (
            <div className="flex items-center gap-2">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary">
                <svg
                  viewBox="0 0 12 12"
                  fill="none"
                  className="size-3 text-white"
                  aria-hidden="true"
                >
                  <path
                    d="M10 3L4.5 8.5L2 6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="text-sm text-foreground">
                Экстренный приём 24/7
              </span>
            </div>
          )
        )}
      </div>
    </ClinicSectionPage>
  );
};
