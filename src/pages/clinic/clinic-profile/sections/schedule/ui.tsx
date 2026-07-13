"use client";

import { FC, useState } from "react";

import {
  DAY_API,
  DAY_LABELS,
  type DayKey,
  type DayState,
  toDay,
  useClinicCabinet,
} from "@/entities/clinic-profile";

import { ClinicSectionPage } from "../../section-page";

const timeInput =
  "border border-border-soft rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none disabled:opacity-40";

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
        DAY_LABELS.map(({ key }) => [
          DAY_API[key],
          {
            from: days[key].open,
            to: days[key].close,
            enabled: days[key].enabled,
          },
        ]),
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
                    <input
                      type="time"
                      value={day.open}
                      disabled={!day.enabled}
                      onChange={(e) => setDay(key, { open: e.target.value })}
                      className={timeInput}
                    />
                    <span className="text-muted">–</span>
                    <input
                      type="time"
                      value={day.close}
                      disabled={!day.enabled}
                      onChange={(e) => setDay(key, { close: e.target.value })}
                      className={timeInput}
                    />
                    <label className="flex items-center gap-2 ml-2 text-sm text-secondary cursor-pointer">
                      <input
                        type="checkbox"
                        checked={day.enabled}
                        onChange={(e) =>
                          setDay(key, { enabled: e.target.checked })
                        }
                        className="accent-primary"
                      />
                      Рабочий
                    </label>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {DAY_LABELS.filter(({ key }) => days[key].enabled).map(
                ({ key, ru }) => (
                  <div key={key} className="flex items-center gap-6">
                    <span className="w-8 text-sm text-secondary">{ru}</span>
                    <span className="text-sm text-foreground">
                      {days[key].open}
                      <span className="mx-2 text-muted">–</span>
                      {days[key].close}
                    </span>
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
              <input
                type="time"
                value={lunchStart}
                onChange={(e) => setLunchStart(e.target.value)}
                className={timeInput}
              />
              <span className="text-muted">–</span>
              <input
                type="time"
                value={lunchEnd}
                onChange={(e) => setLunchEnd(e.target.value)}
                className={timeInput}
              />
            </div>
          ) : (
            <span className="text-sm text-foreground">
              {profile.workSchedule.lunchStart}
              <span className="mx-2 text-muted">–</span>
              {profile.workSchedule.lunchEnd}
            </span>
          )}
        </div>

        {isEditing ? (
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={emergency24}
              onChange={(e) => setEmergency24(e.target.checked)}
              className="accent-primary w-4 h-4"
            />
            <span className="text-sm text-foreground">
              Экстренный приём 24/7
            </span>
          </label>
        ) : (
          profile.workSchedule.emergency24 && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-primary shrink-0" />
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
