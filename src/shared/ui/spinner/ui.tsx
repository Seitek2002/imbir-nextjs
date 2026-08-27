import { FC } from "react";

import { cn } from "@/shared/lib/utils";

type Props = {
  className?: string;
};

// Та же крутилка, что уже разошлась копиями по кнопке, диалогу, лайтбоксу и
// экранам записи. Здесь она вынесена, чтобы новые места не плодили десятую:
// цвет берётся из currentColor, размер задаётся класcом снаружи.
export const Spinner: FC<Props> = ({ className }) => (
  <svg
    className={cn("animate-spin size-5", className)}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden
  >
    <circle
      className="opacity-20"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="3"
    />
    <path
      className="opacity-90"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v3a5 5 0 00-5 5H4z"
    />
  </svg>
);
