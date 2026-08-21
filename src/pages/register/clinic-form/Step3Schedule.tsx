import { Checkbox } from "@/shared/ui";

import { DAYS } from "../model/constants";
import type { ClinicFormData, ScheduleDay } from "../model/types";
import { TimeRange } from "./TimeRange";

const validateTimeRange = (
  range: ScheduleDay,
  label: string,
): string | null => {
  const hasFrom = Boolean(range.from);
  const hasTo = Boolean(range.to);

  if (hasFrom !== hasTo)
    return `Укажите время начала и окончания для: ${label}`;
  if (hasFrom && hasTo && range.from >= range.to)
    return `Время окончания должно быть позже времени начала: ${label}`;
  return null;
};

export const validateSchedule = (data: ClinicFormData): string | null => {
  const scheduleDays = DAYS.map(({ key, label }) => ({
    range: data.schedule[key],
    label,
  }));

  for (const day of scheduleDays) {
    const error = validateTimeRange(day.range, day.label);
    if (error) return error;
  }

  const lunchError = validateTimeRange(data.lunchBreak, "обеденного перерыва");
  if (lunchError) return lunchError;

  const hasWorkingDay = scheduleDays.some(
    ({ range }) => range.from && range.to,
  );
  if (!hasWorkingDay && !data.emergency247)
    return "Выберите время хотя бы для одного дня или включите приём 24/7";

  return null;
};

type Props = {
  data: ClinicFormData;
  onChange: <K extends keyof ClinicFormData>(
    key: K,
    value: ClinicFormData[K],
  ) => void;
  onDayChange: (
    day: keyof ClinicFormData["schedule"],
    value: ScheduleDay,
  ) => void;
  validationError?: string;
};

export const Step3Schedule = ({
  data,
  onChange,
  onDayChange,
  validationError,
}: Props) => (
  <div className="flex flex-col gap-5">
    <p className="text-sm text-muted -mt-2">
      Укажите время проведения процедуры (с какого времени до какого), оставьте
      поля пустыми, если в какой-то день процедура не проводится
    </p>

    <div className="flex flex-col gap-3">
      {DAYS.map(({ key, label }) => (
        <div key={key} className="flex items-center gap-3">
          <span className="text-sm font-medium text-overlay w-6 shrink-0">
            {label}
          </span>
          <div className="flex-1">
            <TimeRange
              value={data.schedule[key]}
              onChange={(v) => onDayChange(key, v)}
            />
          </div>
        </div>
      ))}
    </div>

    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-overlay">
        Обеденный перерыв
      </span>
      <TimeRange
        value={data.lunchBreak}
        onChange={(v) => onChange("lunchBreak", v)}
      />
    </div>

    <Checkbox
      label="Экстренный приём 24/7"
      checked={data.emergency247}
      onChange={(e) => onChange("emergency247", e.target.checked)}
    />

    {validationError && (
      <p role="alert" className="text-sm text-[#DF1C41]">
        {validationError}
      </p>
    )}
  </div>
);
