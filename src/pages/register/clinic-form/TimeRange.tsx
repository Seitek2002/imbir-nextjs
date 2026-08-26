import type { ScheduleDay } from "../model/types";

type Props = {
  disabled?: boolean;
  onChange: (v: ScheduleDay) => void;
  value: ScheduleDay;
};

export const TimeRange = ({ value, onChange, disabled }: Props) => (
  <div className="flex items-center gap-2">
    <input
      type="time"
      value={value.from}
      onChange={(e) => onChange({ ...value, from: e.target.value })}
      disabled={disabled}
      className="flex-1 py-2 px-3 rounded-lg border border-border text-sm text-foreground text-center outline-none focus:shadow-[0_0_1px_3px_rgba(245,101,62,0.3)] disabled:bg-background disabled:text-muted"
    />
    <span className="text-muted shrink-0">—</span>
    <input
      type="time"
      value={value.to}
      onChange={(e) => onChange({ ...value, to: e.target.value })}
      disabled={disabled}
      className="flex-1 py-2 px-3 rounded-lg border border-border text-sm text-foreground text-center outline-none focus:shadow-[0_0_1px_3px_rgba(245,101,62,0.3)] disabled:bg-background disabled:text-muted"
    />
  </div>
);
