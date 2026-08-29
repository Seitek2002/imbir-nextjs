"use client";

import { FC, useEffect, useRef, useState } from "react";
import { useClickAway } from "react-use";

import { ClockIcon } from "@/shared/assets/icons";
import { cn } from "@/shared/lib/utils";

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, "0"),
);

type Props = {
  className?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  placeholder?: string;
  value?: string; // "HH:MM" или ""
};

// Кастомный выбор времени вместо нативного <input type="time"> — две колонки
// (часы / минуты) в фирменном стиле проекта. Значение хранится как "HH:MM".
export const TimeField: FC<Props> = ({
  value = "",
  onChange,
  disabled,
  placeholder = "--:--",
  className,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hoursRef = useRef<HTMLDivElement>(null);
  const minutesRef = useRef<HTMLDivElement>(null);

  useClickAway(containerRef, () => setOpen(false));

  const [h, m] = value.includes(":") ? value.split(":") : ["", ""];

  // При открытии подкручиваем колонки к выбранным значениям.
  useEffect(() => {
    if (!open) return;
    const scrollTo = (wrap: HTMLDivElement | null, selector: null | string) => {
      if (!wrap || !selector) return;
      const el = wrap.querySelector<HTMLElement>(selector);
      if (el) wrap.scrollTop = el.offsetTop - wrap.clientHeight / 2 + 16;
    };
    scrollTo(hoursRef.current, h ? `[data-h="${h}"]` : null);
    scrollTo(minutesRef.current, m ? `[data-m="${m}"]` : null);
  }, [open, h, m]);

  const setHour = (hh: string) => onChange(`${hh}:${m || "00"}`);
  const setMinute = (mm: string) => onChange(`${h || "09"}:${mm}`);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center justify-between gap-1.5 w-24 px-3 py-2 rounded-xl border bg-white text-sm transition-all",
          disabled
            ? "opacity-40 cursor-not-allowed border-border"
            : open
              ? "border-primary shadow-[0_0_1px_3px_rgba(245,101,62,0.15)]"
              : "border-border hover:border-primary/60",
        )}
      >
        <span
          className={cn(
            "tabular-nums",
            value ? "text-foreground" : "text-muted",
          )}
        >
          {value || placeholder}
        </span>
        <ClockIcon
          className={cn("size-4", open ? "text-primary" : "text-muted")}
        />
      </button>

      {open && !disabled && (
        <div className="absolute z-50 top-full mt-1 right-0 flex bg-white rounded-xl border border-border-soft shadow-[0_4px_20px_rgba(0,0,0,0.1)] overflow-hidden">
          <div
            ref={hoursRef}
            className="w-14 max-h-52 overflow-y-auto p-1 border-r border-border-soft"
          >
            {HOURS.map((hh) => (
              <button
                key={hh}
                type="button"
                data-h={hh}
                onClick={() => setHour(hh)}
                className={cn(
                  "w-full py-1.5 rounded-lg text-sm tabular-nums transition-colors",
                  hh === h
                    ? "bg-primary text-white font-semibold"
                    : "text-foreground hover:bg-primary-tint",
                )}
              >
                {hh}
              </button>
            ))}
          </div>
          <div ref={minutesRef} className="w-14 max-h-52 overflow-y-auto p-1">
            {MINUTES.map((mm) => (
              <button
                key={mm}
                type="button"
                data-m={mm}
                onClick={() => setMinute(mm)}
                className={cn(
                  "w-full py-1.5 rounded-lg text-sm tabular-nums transition-colors",
                  mm === m
                    ? "bg-primary text-white font-semibold"
                    : "text-foreground hover:bg-primary-tint",
                )}
              >
                {mm}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
