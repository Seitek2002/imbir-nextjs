"use client";

import { FC, useState } from "react";

import {
  DAY_LABELS,
  type DayKey,
  type DayState,
} from "@/entities/clinic-profile";

import type { ClinicDoctorItem } from "@/shared/api";
import { Button, Dropdown, IconBtn, Modal } from "@/shared/ui";

export const FieldRow: FC<{ children: React.ReactNode; label: string }> = ({
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

type ScheduleEditorProps = {
  isEditing: boolean;
  lunchFrom: string;
  lunchTo: string;
  schedule: Record<DayKey, DayState>;
  setDay: (key: DayKey, patch: Partial<DayState>) => void;
  setLunchFrom: (v: string) => void;
  setLunchTo: (v: string) => void;
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

    <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-background">
      <span className="text-sm font-medium text-foreground shrink-0">
        Обеденный перерыв
      </span>
      <div className="flex items-center gap-3">
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
  </div>
);

// Врачи с активной привязкой к клинике. is_active бэк отдаёт всегда; если
// поля вдруг нет — считаем связь активной.
export const activeClinicDoctors = (doctors: ClinicDoctorItem[]) =>
  doctors.filter((d) => d.is_active !== false);

// doctor_ids для сохранения: только выбранные и при этом привязанные сейчас
// врачи. Врач, которого открепили после назначения, в форме не виден, но его
// id оставался в состоянии — и сохранение падало с 400 «Некоторые врачи не
// принадлежат этой клинике».
export const linkedDoctorIds = (
  doctors: ClinicDoctorItem[],
  selectedIds: string[],
): number[] => {
  const linked = new Set(activeClinicDoctors(doctors).map((d) => String(d.id)));
  return selectedIds.filter((id) => linked.has(id)).map(Number);
};

type SpecialistsPickerProps = {
  doctors: ClinicDoctorItem[];
  isEditing: boolean;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  selectedIds: string[];
};

// Список «Специалисты, выполняющие услугу» — врачи клиники из
// GET /api/clinic/doctors/, на сохранение уходят в doctor_ids.
export const SpecialistsPicker: FC<SpecialistsPickerProps> = ({
  doctors,
  selectedIds,
  onAdd,
  onRemove,
  isEditing,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [draftId, setDraftId] = useState("");

  // Только реально привязанные врачи: неактивную связь бэк в doctor_ids не
  // примет (400), а откреплённого врача в списке нет вовсе.
  const linked = activeClinicDoctors(doctors);
  const selected = linked.filter((d) => selectedIds.includes(String(d.id)));
  const available = linked.filter((d) => !selectedIds.includes(String(d.id)));

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
                <IconBtn
                  type="button"
                  onClick={() => onRemove(String(doc.id))}
                  variant="text"
                  size="xs"
                  className="text-dim hover:text-red-500 shrink-0"
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
                </IconBtn>
              )}
            </div>
          ))}
        </div>
      )}

      {isEditing &&
        (selected.length === 0 ? (
          // Пустой список — первый специалист выбирается прямо тут (как в
          // макете «Добавить процедуру»), без модалки.
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
          // Список уже не пуст — дальнейшие добавления через модалку (как в
          // макете «Редактировать»), чтобы не перестраивать уже видимые строки.
          <Button
            type="button"
            variant="text"
            onClick={() => setModalOpen(true)}
            className="text-primary"
          >
            + Добавить специалиста
          </Button>
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
