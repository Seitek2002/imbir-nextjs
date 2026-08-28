"use client";

import type { ButtonHTMLAttributes, FC } from "react";

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
 *
 * Крест нарисован инлайн, а не общей RemoveIcon, ради совпадения с соседней
 * галочкой. Дело в разной геометрии исходников: у check.svg viewBox 20×20 и
 * глиф шириной 13 единиц, у RemoveIcon — viewBox 24×24 и глиф 8.5 единиц.
 * При одном и том же size-4 это даёт 10.4px против 5.7px — крест выглядел
 * вдвое мельче галочки. Здесь тот же viewBox 20×20 и тот же горизонтальный
 * охват 3.5–16.5, что у галочки, поэтому глифы совпадают ровно.
 */
export const CancelEditIconButton: FC<Props> = ({ className, ...props }) => (
  <IconBtn
    {...props}
    variant="text"
    size="sm"
    className={className}
    aria-label={props["aria-label"] ?? "Отменить редактирование"}
  >
    <svg
      viewBox="0 0 20 20"
      fill="none"
      className="size-4 text-muted"
      aria-hidden
    >
      <path
        d="M3.5 3.5L16.5 16.5M16.5 3.5L3.5 16.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </IconBtn>
);
