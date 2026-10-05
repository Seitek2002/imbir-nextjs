"use client";

import { FC, KeyboardEvent, useEffect, useRef, useState } from "react";
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

// Разбирает то, что человек напечатал: «9:30», «09:30», «930», «0930».
// Возвращает "ЧЧ:ММ" или null, если такого времени не существует.
export const parseTimeInput = (raw: string): null | string => {
  const text = raw.trim();
  let hours: string;
  let minutes: string;
  const match = /^(\d{1,2}):(\d{1,2})$/.exec(text);
  if (match) {
    [, hours, minutes] = match;
  } else if (/^\d{3,4}$/.test(text)) {
    hours = text.slice(0, -2);
    minutes = text.slice(-2);
  } else {
    return null;
  }
  const hh = Number(hours);
  const mm = Number(minutes);
  if (hh > 23 || mm > 59) return null;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
};

// Пока человек печатает, оставляем только цифры и двоеточие и сами ставим
// двоеточие после часов: «0930» превращается в «09:30».
const formatDraft = (raw: string): string => {
  const cleaned = raw.replace(/[^\d:]/g, "");
  const colon = cleaned.indexOf(":");
  if (colon !== -1) {
    const hours = cleaned.slice(0, colon).slice(0, 2);
    const minutes = cleaned
      .slice(colon + 1)
      .replace(/:/g, "")
      .slice(0, 2);
    return `${hours}:${minutes}`;
  }
  const digits = cleaned.slice(0, 4);
  return digits.length <= 2
    ? digits
    : `${digits.slice(0, 2)}:${digits.slice(2)}`;
};

// Ввод времени и выбор из списка. Значение хранится как "HH:MM".
//
// Печатать можно как угодно: «9:30», «09:30», «0930». Во время набора наверх
// уходит только законченное верное время, поэтому недописанное «9:3» ничего
// не сбрасывает. Когда поле теряет фокус (или нажат Enter), значение
// приводится к «ЧЧ:ММ»; если оно неверно («25:00»), возвращается прежнее.
export const TimeField: FC<Props> = ({
  value = "",
  onChange,
  disabled,
  placeholder = "--:--",
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(value);
  const [syncedValue, setSyncedValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);
  const hoursRef = useRef<HTMLDivElement>(null);
  const minutesRef = useRef<HTMLDivElement>(null);

  // Внешнее значение (выбор из списка, загрузка формы) перекрывает черновик.
  if (value !== syncedValue) {
    setSyncedValue(value);
    setDraft(value);
  }

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

  const handleTyping = (raw: string) => {
    const next = formatDraft(raw);
    setDraft(next);
    if (/^\d{2}:\d{2}$/.test(next)) {
      const parsed = parseTimeInput(next);
      if (parsed && parsed !== value) onChange(parsed);
    }
  };

  const commit = (raw: string) => {
    const text = raw.trim();
    if (text === "") {
      if (value !== "") onChange("");
      setDraft("");
      return;
    }
    const parsed = parseTimeInput(text);
    if (parsed) {
      setDraft(parsed);
      if (parsed !== value) onChange(parsed);
    } else {
      setDraft(value);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commit(draft);
      setOpen(false);
    } else if (e.key === "Escape") {
      setDraft(value);
      setOpen(false);
      e.currentTarget.blur();
    }
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div
        className={cn(
          "flex items-center justify-between gap-1.5 w-24 px-3 py-2 rounded-xl border bg-white text-sm transition-all",
          disabled
            ? "opacity-40 cursor-not-allowed border-border"
            : open
              ? "border-primary shadow-[0_0_1px_3px_rgba(245,101,62,0.15)]"
              : "border-border hover:border-primary/60 focus-within:border-primary",
        )}
      >
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          maxLength={5}
          disabled={disabled}
          value={draft}
          placeholder={placeholder}
          aria-label="Время"
          onChange={(e) => handleTyping(e.target.value)}
          onBlur={() => commit(draft)}
          onKeyDown={handleKeyDown}
          className={cn(
            "w-full min-w-0 bg-transparent outline-none tabular-nums placeholder:text-muted disabled:cursor-not-allowed",
            draft ? "text-foreground" : "text-muted",
          )}
        />
        <button
          type="button"
          disabled={disabled}
          aria-label="Выбрать время из списка"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="shrink-0 -mr-1 p-0.5 rounded-md hover:bg-primary-tint disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
          <ClockIcon
            className={cn("size-4", open ? "text-primary" : "text-muted")}
          />
        </button>
      </div>

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
