import type { ButtonHTMLAttributes, FC } from "react";

import { Button } from "../button";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

/**
 * Единая кнопка выхода из режима редактирования без сохранения изменений.
 * Внешний вид намеренно использует базовую outline-кнопку сайта.
 */
export const CancelEditButton: FC<Props> = ({
  className,
  type = "button",
  ...props
}) => (
  <Button
    {...props}
    type={type}
    variant="outline"
    size="sm"
    className={className}
    aria-label={props["aria-label"] ?? "Отменить редактирование"}
  >
    Отмена
  </Button>
);
