import { FC } from "react";

import { cn } from "@/shared/lib/utils";

type Props = {
  className?: string;
};

// Единая крутилка на весь проект. До этого тот же svg был скопирован в восьми
// местах — кнопка, диалог подтверждения, лайтбокс, поиск, AuthGuard и три
// экрана записи, причём в двух разных начертаниях.
//
// Взят тот вариант, который встречался чаще (7 файлов против 1), чтобы перевод
// не менял вид большинства экранов. Цвет — из currentColor, размер — классом снаружи.
export const Spinner: FC<Props> = ({ className }) => (
  <svg
    className={cn("animate-spin size-5", className)}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
    />
  </svg>
);
