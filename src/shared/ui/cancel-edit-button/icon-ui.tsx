"use client";

import type { ButtonHTMLAttributes, FC } from "react";

import { RemoveIcon } from "@/shared/assets/icons";

import { IconBtn } from "../icon-button";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

/**
 * То же, что CancelEditButton, но для мобильных шапок, где рядом стоит
 * галочка сохранения и на текстовую кнопку места нет. Раньше выйти из
 * редактирования на телефоне можно было только стрелкой «назад» — и то не
 * везде: в разделах профиля клиники она просто уводила со страницы вместе с
 * несохранёнными правками.
 *
 * Крестик серый, а не фирменный оранжевый: рядом стоит галочка сохранения, и
 * основное действие должно быть одно.
 */
export const CancelEditIconButton: FC<Props> = ({ className, ...props }) => (
  <IconBtn
    {...props}
    variant="text"
    size="sm"
    className={className}
    aria-label={props["aria-label"] ?? "Отменить редактирование"}
  >
    <RemoveIcon className="size-4 [&_path]:stroke-muted" />
  </IconBtn>
);
