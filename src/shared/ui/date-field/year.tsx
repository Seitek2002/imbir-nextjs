"use client";

import type { FC } from "react";

import { Input } from "@/shared/ui/input";

type Props = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  hint?: string;
  placeholder?: string;
  // Нижняя граница разумного года. Верхняя — текущий год плюс запас: у
  // студентов год окончания ещё в будущем.
  min?: number;
  maxAhead?: number;
  className?: string;
};

const YEAR_DIGITS = 4;

export const YearField: FC<Props> = ({
  label,
  value,
  onChange,
  error,
  hint,
  placeholder = "ГГГГ",
  min = 1950,
  maxAhead = 10,
  className,
}) => {
  const max = new Date().getFullYear() + maxAhead;

  // Поле просит ГГГГ, поэтому и принимает ровно четыре цифры: раньше сюда
  // влезало «121212121212», и бэк получал мусор.
  const handleChange = (raw: string) => {
    onChange(raw.replace(/\D/g, "").slice(0, YEAR_DIGITS));
  };

  const isComplete = value.length === YEAR_DIGITS;
  const year = Number(value);
  const rangeError =
    isComplete && (year < min || year > max)
      ? `Год должен быть между ${min} и ${max}`
      : undefined;

  return (
    <Input
      label={label}
      placeholder={placeholder}
      value={value}
      onChange={(e) => handleChange(e.target.value)}
      error={error ?? rangeError}
      hint={hint}
      inputMode="numeric"
      maxLength={YEAR_DIGITS}
      autoComplete="off"
      className={className}
    />
  );
};
