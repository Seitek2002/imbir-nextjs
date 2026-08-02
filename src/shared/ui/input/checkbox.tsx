"use client";

import { FC, InputHTMLAttributes, useEffect, useRef } from "react";

import { cn } from "@/shared/lib/utils";

type CheckboxSize = "small" | "large";

type Props = {
  size?: CheckboxSize;
  label?: string;
  indeterminate?: boolean;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "size">;

export const Checkbox: FC<Props> = ({
  size = "small",
  label,
  indeterminate,
  className,
  ...props
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = !!indeterminate;
    }
  }, [indeterminate]);

  const sizeClasses = {
    small: "size-4", // 16px
    large: "size-5", // 20px
  };

  const visualBase = cn(
    "relative flex items-center justify-center rounded-full border transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none",
    "border-border-soft bg-white",
    // Стили для самого круга при разных состояниях
    "peer-checked:bg-primary peer-checked:border-primary",
    "peer-indeterminate:bg-primary peer-indeterminate:border-primary",
    "peer-focus-visible:shadow-[0_0_0.5px_2px_rgba(245,101,62,0.2)] peer-focus-visible:border-primary",

    // МАГИЯ ЗДЕСЬ: Управляем иконками через родителя
    // Когда peer checked — показываем первый div (галочку)
    "peer-checked:[&>.check]:opacity-100 peer-checked:[&>.check]:scale-100",
    // Когда peer indeterminate — показываем второй div (минус)
    "peer-indeterminate:[&>.minus]:opacity-100 peer-indeterminate:[&>.minus]:scale-100",

    sizeClasses[size],
  );

  const iconStyles = "text-white shrink-0 size-3";

  return (
    <label
      className={cn(
        "group flex cursor-pointer items-center gap-2.5",
        className,
      )}
    >
      <div className="relative flex items-center justify-center">
        <input
          ref={inputRef}
          type="checkbox"
          className="peer sr-only"
          disabled={props.disabled}
          {...props}
        />

        <div className={visualBase}>
          {/* Иконка галочки (класс "check") */}
          <div className="check absolute inset-0 flex items-center justify-center opacity-0 scale-50 transition-all duration-200">
            <svg viewBox="0 0 12 12" fill="none" className={iconStyles}>
              <path
                d="M10 3L4.5 8.5L2 6"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          {/* Иконка минуса (класс "minus") */}
          <div className="minus absolute inset-0 flex items-center justify-center opacity-0 scale-50 transition-all duration-200">
            <svg viewBox="0 0 12 12" fill="none" className={iconStyles}>
              <path
                d="M2.5 6H9.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {label && (
        <span
          className={cn(
            "font-medium text-overlay",
            size === "large" ? "text-base" : "text-sm",
          )}
        >
          {label}
        </span>
      )}
    </label>
  );
};
