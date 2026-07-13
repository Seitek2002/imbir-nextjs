"use client";

import { FC, useState } from "react";

import { AppointmentDateTimePicker } from "@/widgets/appointment-datetime-picker";

import {
  DAY_LABELS,
  type DayKey,
  type DayState,
} from "@/entities/clinic-profile";

import type { ClinicDoctorItem } from "@/shared/api";
import type { TimeGroup } from "@/shared/lib/booking";
import { Button, Dropdown, Modal } from "@/shared/ui";

export const inp =
  "w-full px-4 py-3 rounded-2xl border border-border text-foreground placeholder:text-dim focus:outline-none focus:border-primary transition-colors bg-white";
export const lbl = "block text-foreground text-sm font-medium mb-1.5";

export const FieldRow: FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div className="py-3 border-b border-background last:border-b-0">
    <div className="text-muted text-sm mb-1">{label}</div>
    <div className="text-foreground font-medium text-base">
      {children || "—"}
    </div>
  </div>
);

// Демо-сетка слотов «Записи» — на бэке нет отдельного расписания записи для
// конкретной процедуры, поэтому блок статичный/иллюстративный, без реальных
// данных о занятости.
export const DEMO_TIME_GROUPS: TimeGroup[] = [
  {
    label: "Утро",
    slots: [
      { value: "08:00" },
      { value: "09:00" },
      { value: "10:00" },
      { value: "11:00" },
      { value: "12:00" },
    ],
  },
  {
    label: "Обед",
    slots: [
      { value: "13:00" },
      { value: "14:00" },
      { value: "15:00", disabled: true },
      { value: "16:00", disabled: true },
      { value: "17:00" },
    ],
  },
  {
    label: "Вечер",
    slots: [
      { value: "18:00" },
      { value: "19:00", disabled: true },
      { value: "20:00" },
      { value: "21:00" },
    ],
  },
];

// Блок «Записи»: тот же календарь+слоты, что на публичной странице /record —
// здесь чисто иллюстративный (демо-данные, ничего не сохраняет и не читает
// реальную занятость конкретной процедуры, такого API пока нет).
export const RecordsPreview: FC = () => {
  const [mode, setMode] = useState<"online" | "offline">("online");
  const [date, setDate] = useState<Date | null>(new Date());
  const [time, setTime] = useState<string | null>("11:00");

  return (
    <AppointmentDateTimePicker
      mode={mode}
      onModeChange={setMode}
      selectedDate={date}
      onDateChange={setDate}
      selectedTime={time}
      onTimeChange={setTime}
      timeGroups={DEMO_TIME_GROUPS}
    />
  );
};

type ScheduleEditorProps = {
  schedule: Record<DayKey, DayState>;
  setDay: (key: DayKey, patch: Partial<DayState>) => void;
  lunchFrom: string;
  lunchTo: string;
  setLunchFrom: (v: string) => void;
  setLunchTo: (v: string) => void;
  isEditing: boolean;
};

const timeInput =
  "w-24 px-3 py-2 rounded-xl border border-border-soft text-sm text-foreground focus:outline-none focus:border-primary transition-colors disabled:opacity-40";

// График проведения процедуры — те же 7 дней + обед, что в расписании клиники
// и врача. Не персистится (в ClinicServiceBody такого поля нет).
export const ScheduleEditor: FC<ScheduleEditorProps> = ({
  schedule,
  setDay,
  lunchFrom,
  lunchTo,
  setLunchFrom,
  setLunchTo,
  isEditing,
}) => (
  <div>
    {isEditing && (
      <p className="text-muted text-sm mb-4 leading-relaxed">
        Укажите время проведения процедуры (с какого времени до какого),
        оставьте поля пустыми, если в какой-то день процедура не проводится
      </p>
    )}
    <div className="flex flex-col gap-3">
      {DAY_LABELS.map(({ key, ru }) => {
        const day = schedule[key];
        if (!isEditing && !day.enabled) return null;
        return (
          <div key={key} className="flex items-center gap-3">
            <span className="w-8 text-sm text-secondary shrink-0">{ru}</span>
            {isEditing ? (
              <>
                <input
                  type="time"
                  value={day.open}
                  onChange={(e) =>
                    setDay(key, { open: e.target.value, enabled: true })
                  }
                  className={timeInput}
                />
                <span className="text-muted">–</span>
                <input
                  type="time"
                  value={day.close}
                  onChange={(e) =>
                    setDay(key, { close: e.target.value, enabled: true })
                  }
                  className={timeInput}
                />
              </>
            ) : (
              <span className="text-sm text-foreground">
                {day.open}
                <span className="mx-2 text-muted">–</span>
                {day.close}
              </span>
            )}
          </div>
        );
      })}
    </div>

    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-background">
      <span className="text-sm font-medium text-foreground shrink-0">
        Обеденный перерыв
      </span>
      {isEditing ? (
        <>
          <input
            type="time"
            value={lunchFrom}
            onChange={(e) => setLunchFrom(e.target.value)}
            className={timeInput}
          />
          <span className="text-muted">–</span>
          <input
            type="time"
            value={lunchTo}
            onChange={(e) => setLunchTo(e.target.value)}
            className={timeInput}
          />
        </>
      ) : (
        <span className="text-sm text-foreground">
          {lunchFrom}
          <span className="mx-2 text-muted">–</span>
          {lunchTo}
        </span>
      )}
    </div>
  </div>
);

type SpecialistsPickerProps = {
  doctors: ClinicDoctorItem[];
  selectedIds: string[];
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  isEditing: boolean;
};

// Список «Специалисты, выполняющие услугу» — реальные имена из списка врачей
// клиники (GET /api/clinic/doctors/), но сама привязка услуга↔врач нигде не
// сохраняется: в ClinicServiceBody такого поля нет.
export const SpecialistsPicker: FC<SpecialistsPickerProps> = ({
  doctors,
  selectedIds,
  onAdd,
  onRemove,
  isEditing,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [draftId, setDraftId] = useState("");

  const selected = doctors.filter((d) => selectedIds.includes(String(d.id)));
  const available = doctors.filter((d) => !selectedIds.includes(String(d.id)));

  return (
    <div>
      {selected.length > 0 && (
        <div className="flex flex-col gap-2 mb-3">
          {selected.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border border-border"
            >
              <span className="text-foreground text-sm">{doc.full_name}</span>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => onRemove(String(doc.id))}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-dim hover:text-red-500 transition-colors shrink-0"
                  aria-label="Убрать"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {isEditing &&
        (selected.length === 0 ? (
          <Dropdown
            placeholder="Выберите из списка"
            options={available.map((d) => ({
              label: d.full_name,
              value: String(d.id),
            }))}
            value=""
            onChange={(val) => val && onAdd(val)}
            className="w-full"
          />
        ) : (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="text-primary text-sm font-medium hover:underline"
          >
            + Добавить специалиста
          </button>
        ))}

      {selected.length === 0 && !isEditing && (
        <p className="text-muted text-sm">—</p>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Добавить специалиста"
      >
        <div className="space-y-4">
          <Dropdown
            placeholder="Выберите из списка"
            options={available.map((d) => ({
              label: d.full_name,
              value: String(d.id),
            }))}
            value={draftId}
            onChange={setDraftId}
            className="w-full"
          />
          <Button
            className="w-full justify-center"
            disabled={!draftId}
            onClick={() => {
              onAdd(draftId);
              setDraftId("");
              setModalOpen(false);
            }}
          >
            Добавить
          </Button>
        </div>
      </Modal>
    </div>
  );
};
