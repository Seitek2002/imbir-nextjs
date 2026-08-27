"use client";

import { FC, useEffect, useMemo, useRef, useState } from "react";

import { ArrowLeftIcon, ArrowRightIcon } from "@/shared/assets/icons";
import type { TimeGroup } from "@/shared/lib/booking";
import { cn } from "@/shared/lib/utils";
import { IconBtn, Spinner } from "@/shared/ui";

// Переключателя «Онлайн / Оффлайн» здесь больше нет: приёмы на платформе
// только онлайн. Раньше он предлагал офлайн у всех врачей подряд, хотя место
// приёма заполнено у единиц, — прийти к остальным было физически некуда.
type Props = {
  className?: string;
  isDateDisabled?: (date: Date) => boolean;
  isDoctorSelected?: boolean;
  isLoadingSlots?: boolean;
  onDateChange: (date: Date) => void;
  onTimeChange: (time: string) => void;
  selectedDate: Date | null;
  selectedTime: null | string;
  timeGroups?: TimeGroup[];
};

// Сообщение над слотами. При загрузке рядом с текстом крутится спиннер:
// без него строка не отличалась от «Нет свободного времени» и прочих тупиковых
// состояний — непонятно, ждать или менять дату. Вывод один на оба макета.
const SlotsMessage: FC<{ isLoading?: boolean; text: string }> = ({
  text,
  isLoading,
}) => (
  <p className="flex items-center justify-center gap-2 text-sm text-muted text-center py-2">
    {isLoading && <Spinner className="size-4 text-primary shrink-0" />}
    {text}
  </p>
);

const WEEK_DAYS = ["ПН", "ВТ", "СР", "ЧТ", "ПТ", "СБ", "ВС"];

const MONTHS = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];

const toMondayIndex = (day: number) => (day + 6) % 7;

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const addDays = (date: Date, days: number) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};

const pad = (n: number) => String(n).padStart(2, "0");

export const AppointmentDateTimePicker: FC<Props> = ({
  selectedDate,
  onDateChange,
  selectedTime,
  onTimeChange,
  timeGroups = [],
  isLoadingSlots,
  isDateDisabled,
  isDoctorSelected = true,
  className,
}) => {
  const slotsMessage = !isDoctorSelected
    ? "Сначала выберите врача"
    : isLoadingSlots
      ? "Загрузка свободного времени..."
      : !selectedDate
        ? "Выберите дату, чтобы увидеть свободное время"
        : timeGroups.length === 0
          ? "Нет свободного времени на выбранную дату"
          : null;
  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedBtnRef = useRef<HTMLButtonElement>(null);

  const [monthCursor, setMonthCursor] = useState(() => {
    const d = selectedDate ?? new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  // Auto-scroll selected date into view on mobile
  useEffect(() => {
    if (!selectedBtnRef.current || !scrollRef.current) return;
    const container = scrollRef.current;
    const btn = selectedBtnRef.current;
    const left =
      btn.offsetLeft - container.offsetWidth / 2 + btn.offsetWidth / 2;
    container.scrollTo({ left, behavior: "smooth" });
  }, [selectedDate]);

  const monthLabel = `${MONTHS[monthCursor.getMonth()]} ${monthCursor.getFullYear()}`;

  // Desktop: full month calendar cells
  const monthCells = useMemo(() => {
    const firstDay = new Date(
      monthCursor.getFullYear(),
      monthCursor.getMonth(),
      1,
    );
    const daysInMonth = new Date(
      monthCursor.getFullYear(),
      monthCursor.getMonth() + 1,
      0,
    ).getDate();
    const leading = toMondayIndex(firstDay.getDay());

    const cells: Array<{ date: Date | null; disabled: boolean; key: string }> =
      [];

    for (let i = 0; i < leading; i++) {
      cells.push({ date: null, disabled: true, key: `empty-${i}` });
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        monthCursor.getFullYear(),
        monthCursor.getMonth(),
        day,
      );
      cells.push({
        date,
        disabled: isDateDisabled?.(date) ?? false,
        key: `d-${day}`,
      });
    }
    while (cells.length % 7 !== 0) {
      cells.push({ date: null, disabled: true, key: `tail-${cells.length}` });
    }
    return cells;
  }, [monthCursor, isDateDisabled]);

  // Mobile: horizontal strip for current month plus adjacent days
  const mobileStrip = useMemo(() => {
    const firstDay = new Date(
      monthCursor.getFullYear(),
      monthCursor.getMonth(),
      1,
    );
    const lastDay = new Date(
      monthCursor.getFullYear(),
      monthCursor.getMonth() + 1,
      0,
    );
    const start = addDays(firstDay, -7);
    const total =
      Math.round((lastDay.getTime() - start.getTime()) / 86400000) + 1 + 7;
    return Array.from({ length: total }, (_, i) => {
      const date = addDays(start, i);
      return { date, disabled: isDateDisabled?.(date) ?? false };
    });
  }, [monthCursor, isDateDisabled]);

  const handleDateSelect = (date: Date) => {
    onDateChange(date);
    if (
      date.getMonth() !== monthCursor.getMonth() ||
      date.getFullYear() !== monthCursor.getFullYear()
    ) {
      setMonthCursor(new Date(date.getFullYear(), date.getMonth(), 1));
    }
  };

  const monthNav = (
    <div className="flex items-center justify-between bg-background rounded-xl px-2 py-1.5">
      <IconBtn
        variant="text"
        size="xs"
        className="hover:bg-white"
        aria-label="Предыдущий месяц"
        onClick={() =>
          setMonthCursor((p) => new Date(p.getFullYear(), p.getMonth() - 1, 1))
        }
      >
        <ArrowLeftIcon className="size-4" />
      </IconBtn>
      <span className="text-sm font-medium text-foreground">{monthLabel}</span>
      <IconBtn
        variant="text"
        size="xs"
        className="hover:bg-white"
        aria-label="Следующий месяц"
        onClick={() =>
          setMonthCursor((p) => new Date(p.getFullYear(), p.getMonth() + 1, 1))
        }
      >
        <ArrowRightIcon className="size-4" />
      </IconBtn>
    </div>
  );

  return (
    <div className={cn("space-y-3", className)}>
      {/* MOBILE layout */}
      <div className="lg:hidden space-y-3">
        <div className="border border-border-soft rounded-2xl p-3">
          {monthNav}
          {/* Scrollable day strip */}
          <div
            ref={scrollRef}
            className="mt-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <div className="flex gap-2" style={{ width: "max-content" }}>
              {mobileStrip.map((item) => {
                const isSelected = selectedDate
                  ? isSameDay(selectedDate, item.date)
                  : false;
                const dayLabel = WEEK_DAYS[toMondayIndex(item.date.getDay())];
                return (
                  <button
                    key={`${item.date.getFullYear()}-${item.date.getMonth()}-${item.date.getDate()}`}
                    ref={isSelected ? selectedBtnRef : null}
                    type="button"
                    onClick={() =>
                      !item.disabled && handleDateSelect(item.date)
                    }
                    disabled={item.disabled || !isDoctorSelected}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1 w-12 h-14 rounded-xl border text-sm transition-all shrink-0",
                      isSelected
                        ? "border-primary text-primary bg-[#FFF3EE]"
                        : "border-border-soft text-foreground bg-white",
                      (item.disabled || !isDoctorSelected) &&
                        "bg-background text-[#A9AFB2] border-[#ECEDEE] cursor-not-allowed",
                    )}
                  >
                    <span
                      className={cn(
                        "text-[10px]",
                        isSelected ? "text-primary" : "text-muted",
                      )}
                    >
                      {dayLabel}
                    </span>
                    <span className="font-medium">
                      {pad(item.date.getDate())}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Time slots mobile */}
        <div className="border border-border-soft rounded-2xl p-3 space-y-3">
          {slotsMessage && (
            <SlotsMessage text={slotsMessage} isLoading={isLoadingSlots} />
          )}
          {timeGroups.map((group) => (
            <div key={group.label}>
              <p className="text-sm text-secondary mb-2">{group.label}</p>
              <div className="flex flex-wrap gap-1.5">
                {group.slots.map((slot) => {
                  const isSelected = selectedTime === slot.value;
                  return (
                    <button
                      key={slot.value}
                      type="button"
                      onClick={() => !slot.disabled && onTimeChange(slot.value)}
                      disabled={slot.disabled}
                      className={cn(
                        "min-w-14 px-2 h-9 rounded-lg border text-sm transition-colors",
                        isSelected
                          ? "border-primary text-primary bg-[#FFF3EE]"
                          : "border-border-soft text-foreground",
                        slot.disabled &&
                          "bg-background text-[#A9AFB2] border-[#ECEDEE] cursor-not-allowed",
                      )}
                    >
                      {slot.value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* DESKTOP layout */}
      <div className="hidden lg:grid lg:grid-cols-2 gap-3">
        <div className="border border-border-soft rounded-2xl p-3">
          {monthNav}
          <div className="mt-3">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {WEEK_DAYS.map((d) => (
                <span key={d} className="text-center text-xs text-muted py-1">
                  {d}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1.5">
              {monthCells.map((cell) => {
                if (!cell.date) return <div key={cell.key} className="h-9" />;
                const isSelected = selectedDate
                  ? isSameDay(selectedDate, cell.date)
                  : false;
                const date = cell.date;
                return (
                  <button
                    key={cell.key}
                    type="button"
                    onClick={() =>
                      !cell.disabled &&
                      isDoctorSelected &&
                      handleDateSelect(date)
                    }
                    disabled={cell.disabled || !isDoctorSelected}
                    className={cn(
                      "h-9 rounded-lg border text-sm transition-all",
                      isSelected
                        ? "border-primary text-primary bg-[#FFF3EE]"
                        : "border-border-soft text-foreground hover:border-primary/40",
                      (cell.disabled || !isDoctorSelected) &&
                        "bg-background text-[#A9AFB2] border-[#ECEDEE] cursor-not-allowed",
                    )}
                  >
                    {pad(date.getDate())}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="border border-border-soft rounded-2xl p-3 space-y-3">
          {slotsMessage && (
            <SlotsMessage text={slotsMessage} isLoading={isLoadingSlots} />
          )}
          {timeGroups.map((group) => (
            <div key={group.label}>
              <p className="text-sm text-secondary mb-2">{group.label}</p>
              <div className="flex flex-wrap gap-1.5">
                {group.slots.map((slot) => {
                  const isSelected = selectedTime === slot.value;
                  return (
                    <button
                      key={slot.value}
                      type="button"
                      onClick={() => !slot.disabled && onTimeChange(slot.value)}
                      disabled={slot.disabled}
                      className={cn(
                        "min-w-14 px-2 h-9 rounded-lg border text-sm transition-colors",
                        isSelected
                          ? "border-primary text-primary bg-[#FFF3EE]"
                          : "border-border-soft text-foreground hover:border-primary/40",
                        slot.disabled &&
                          "bg-background text-[#A9AFB2] border-[#ECEDEE] cursor-not-allowed",
                      )}
                    >
                      {slot.value}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
