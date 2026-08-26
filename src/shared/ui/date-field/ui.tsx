"use client";

import { type FC, useEffect, useMemo, useRef, useState } from "react";

import { ArrowLeftIcon, ArrowRightIcon } from "@/shared/assets/icons";
import { colors } from "@/shared/config";
import { cn } from "@/shared/lib/utils";
import { Input } from "@/shared/ui/input";

type Props = {
  className?: string;
  error?: string;
  hint?: string;
  label?: string;
  max?: string;
  // Запретить будущие даты (для дат рождения). Отдельным флагом, а не max с
  // сегодняшним числом: new Date() в рендере дал бы разные значения на сервере
  // и на клиенте, и React ругнулся бы на несовпадение атрибутов.
  maxToday?: boolean;
  // Границы для календаря, тоже в ДД.ММ.ГГГГ.
  min?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  // Значение в формате ДД.ММ.ГГГГ — так его хранят анкеты регистрации, а на
  // бэк оно уходит через toApiDate.
  value: string;
};

const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <rect
      x="2.25"
      y="3.75"
      width="13.5"
      height="12"
      rx="2"
      stroke={colors.muted}
      strokeWidth="1.3"
    />
    <path
      d="M2.25 7.5h13.5M6 2.25v3M12 2.25v3"
      stroke={colors.muted}
      strokeWidth="1.3"
      strokeLinecap="round"
    />
  </svg>
);

// Ставит точки за пользователя: 18022003 -> 18.02.2003. Пользователь набирает
// только цифры, всё остальное — разделители, которые он вводить не должен.
const maskDate = (raw: string): string => {
  const digits = raw.replace(/\D/g, "").slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)]
    .filter(Boolean)
    .join(".");
};

// Календарь может вернуть 31.02 — существование даты проверяем через Date,
// иначе бэк получит несуществующий день и ответит невнятной ошибкой валидации.
const isRealDate = (ddmmyyyy: string): boolean => {
  const [dd, mm, yyyy] = ddmmyyyy.split(".").map(Number);
  if (!dd || !mm || !yyyy) return false;
  const d = new Date(yyyy, mm - 1, dd);
  return (
    d.getFullYear() === yyyy && d.getMonth() === mm - 1 && d.getDate() === dd
  );
};

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

const WEEK_DAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const pad = (value: number) => String(value).padStart(2, "0");

const parseDate = (value: string): Date | null => {
  if (!isRealDate(value)) return null;
  const [day, month, year] = value.split(".").map(Number);
  return new Date(year, month - 1, day);
};

const formatDate = (date: Date) =>
  `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.${date.getFullYear()}`;

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const DateField: FC<Props> = ({
  label,
  value,
  onChange,
  error,
  hint,
  min,
  max,
  maxToday,
  placeholder = "ДД.ММ.ГГГГ",
  className,
}) => {
  const calendarRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [monthCursor, setMonthCursor] = useState(() => {
    const selected = parseDate(value) ?? new Date();
    return new Date(selected.getFullYear(), selected.getMonth(), 1);
  });

  useEffect(() => {
    if (!isOpen) return;
    const handleOutsidePointer = (event: PointerEvent) => {
      if (
        calendarRef.current &&
        !calendarRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("pointerdown", handleOutsidePointer);
    return () =>
      document.removeEventListener("pointerdown", handleOutsidePointer);
  }, [isOpen]);

  const isComplete = value.replace(/\D/g, "").length === 8;
  const formatError =
    isComplete && !isRealDate(value) ? "Такой даты не существует" : undefined;

  const selectedDate = parseDate(value);
  const minDate = parseDate(min ?? "");
  const maxDate = parseDate(max ?? "");
  const today = startOfDay(new Date());
  const lastAllowedDate = maxToday
    ? maxDate && maxDate < today
      ? maxDate
      : today
    : maxDate;

  const isDateDisabled = (date: Date) => {
    const current = startOfDay(date);
    return Boolean(
      (minDate && current < minDate) ||
      (lastAllowedDate && current > lastAllowedDate),
    );
  };

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
    const leading = (firstDay.getDay() + 6) % 7;
    const cells: Array<Date | null> = Array.from(
      { length: leading },
      () => null,
    );

    for (let day = 1; day <= daysInMonth; day++) {
      cells.push(
        new Date(monthCursor.getFullYear(), monthCursor.getMonth(), day),
      );
    }
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [monthCursor]);

  const toggleCalendar = () => {
    if (!isOpen) {
      const nextMonth = selectedDate ?? new Date();
      setMonthCursor(
        new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 1),
      );
    }
    setIsOpen((open) => !open);
  };

  const selectDate = (date: Date) => {
    if (isDateDisabled(date)) return;
    onChange(formatDate(date));
    setIsOpen(false);
  };

  const selectToday = () => {
    if (!isDateDisabled(today)) selectDate(today);
  };

  return (
    <div ref={calendarRef} className={cn("relative", className)}>
      <Input
        label={label}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(maskDate(e.target.value))}
        error={error ?? formatError}
        hint={hint}
        inputMode="numeric"
        autoComplete="off"
        IconRight={CalendarIcon}
        onIconRightClick={toggleCalendar}
        iconRightLabel="Открыть календарь"
      />
      {isOpen && (
        <div
          role="dialog"
          aria-label="Выбор даты"
          className="absolute right-0 top-full z-50 mt-2 w-[280px] rounded-lg border border-border-soft bg-white p-3 shadow-[0_8px_24px_rgba(24,32,38,0.12)]"
        >
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              aria-label="Предыдущий месяц"
              onClick={() =>
                setMonthCursor(
                  (current) =>
                    new Date(current.getFullYear(), current.getMonth() - 1, 1),
                )
              }
              className="flex size-8 items-center justify-center rounded-lg text-secondary hover:bg-background"
            >
              <ArrowLeftIcon className="size-4" />
            </button>
            <span className="text-sm font-medium text-foreground">
              {MONTHS[monthCursor.getMonth()]} {monthCursor.getFullYear()}
            </span>
            <button
              type="button"
              aria-label="Следующий месяц"
              onClick={() =>
                setMonthCursor(
                  (current) =>
                    new Date(current.getFullYear(), current.getMonth() + 1, 1),
                )
              }
              className="flex size-8 items-center justify-center rounded-lg text-secondary hover:bg-background"
            >
              <ArrowRightIcon className="size-4" />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-7 gap-1">
            {WEEK_DAYS.map((day) => (
              <span key={day} className="py-1 text-center text-xs text-muted">
                {day}
              </span>
            ))}
            {monthCells.map((date, index) => {
              if (!date) return <span key={`empty-${index}`} className="h-8" />;
              const disabled = isDateDisabled(date);
              const selected = selectedDate
                ? isSameDay(selectedDate, date)
                : false;
              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  disabled={disabled}
                  aria-label={formatDate(date)}
                  aria-pressed={selected}
                  onClick={() => selectDate(date)}
                  className={cn(
                    "h-8 rounded-lg text-sm transition-colors",
                    selected && "bg-primary text-white",
                    !selected &&
                      !disabled &&
                      "text-foreground hover:bg-[#FFF3EE]",
                    disabled && "cursor-not-allowed text-dim",
                  )}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-border-soft pt-2 text-xs">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setIsOpen(false);
              }}
              className="rounded px-1 text-primary hover:bg-[#FFF3EE]"
            >
              Очистить
            </button>
            <button
              type="button"
              onClick={selectToday}
              disabled={isDateDisabled(today)}
              className="rounded px-1 text-secondary hover:bg-background disabled:cursor-not-allowed disabled:text-dim"
            >
              Сегодня
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
