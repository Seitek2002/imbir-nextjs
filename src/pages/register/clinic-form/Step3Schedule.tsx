import { Checkbox } from "@/shared/ui";

import { DAYS } from "../model/constants";
import type { ClinicFormData, ScheduleDay } from "../model/types";
import { TimeRange } from "./TimeRange";

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
};

export const Step3Schedule = ({ data, onChange, onDayChange }: Props) => (
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
  </div>
);
