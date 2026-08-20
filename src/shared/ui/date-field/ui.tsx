"use client";

import { type FC, useEffect, useRef } from "react";

import { colors } from "@/shared/config";
import { cn } from "@/shared/lib/utils";
import { Input } from "@/shared/ui/input";

type Props = {
  label?: string;
  // Значение в формате ДД.ММ.ГГГГ — так его хранят анкеты регистрации, а на
  // бэк оно уходит через toApiDate.
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  // Границы для календаря, тоже в ДД.ММ.ГГГГ.
  min?: string;
  max?: string;
  // Запретить будущие даты (для дат рождения). Отдельным флагом, а не max с
  // сегодняшним числом: new Date() в рендере дал бы разные значения на сервере
  // и на клиенте, и React ругнулся бы на несовпадение атрибутов.
  maxToday?: boolean;
  placeholder?: string;
  className?: string;
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

const toIso = (ddmmyyyy: string): string => {
  const [dd, mm, yyyy] = ddmmyyyy.split(".");
  if (!dd || !mm || !yyyy || yyyy.length !== 4) return "";
  return `${yyyy}-${mm}-${dd}`;
};

const fromIso = (iso: string): string => {
  const [yyyy, mm, dd] = iso.split("-");
  if (!yyyy || !mm || !dd) return "";
  return `${dd}.${mm}.${yyyy}`;
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
  const nativeRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!maxToday || !nativeRef.current) return;
    nativeRef.current.max = new Date().toISOString().slice(0, 10);
  }, [maxToday]);

  const isComplete = value.replace(/\D/g, "").length === 8;
  const formatError =
    isComplete && !isRealDate(value) ? "Такой даты не существует" : undefined;

  const openPicker = () => {
    const el = nativeRef.current;
    if (!el) return;
    // showPicker — единственный способ открыть нативный календарь программно;
    // click() оставлен фолбэком для браузеров без него.
    if (typeof el.showPicker === "function") el.showPicker();
    else el.click();
  };

  return (
    <div className={cn("relative", className)}>
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
        onIconRightClick={openPicker}
        iconRightLabel="Открыть календарь"
      />
      {/* Нативный date-инпут держим в потоке, но невидимым: показывать его
          вместо текстового поля нельзя — он рисует свой формат под локаль
          браузера, а анкеты хранят дату как ДД.ММ.ГГГГ. */}
      <input
        ref={nativeRef}
        type="date"
        tabIndex={-1}
        aria-hidden="true"
        className="absolute bottom-0 right-10 size-0 opacity-0 pointer-events-none"
        value={toIso(value)}
        min={min ? toIso(min) : undefined}
        max={max ? toIso(max) : undefined}
        onChange={(e) => onChange(fromIso(e.target.value))}
      />
    </div>
  );
};
