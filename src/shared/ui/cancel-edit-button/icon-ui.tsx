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
 * Крест нарисован инлайн, а не общей RemoveIcon. У соседней CheckIcon (см.
 * common/check.svg) в исходнике одновременно заданы width/height и
 * совпадающий viewBox — единственная иконка в проекте с таким набором
 * атрибутов, — и сборка (SVGR/SVGO) считает viewBox избыточным и вырезает
 * его: галочка перестаёт слушаться Tailwind-класса size-* и всегда рисуется
 * «сырыми» 13×8.5px, а не тем размером, что задан снаружи. RemoveIcon при
 * этом честно масштабировался под size-4 и оказывался вдвое мельче — то, что
 * увидел коллега на скриншоте. Трогать сам check.svg рискованно: он
 * используется в ещё ~15 местах на других размерах, ни одно не проверено.
 * Проще нарисовать крест с той же геометрией (viewBox 20×20, тот же
 * горизонтальный охват 3.5–16.5), чем чинить общий файл ради одной кнопки.
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
