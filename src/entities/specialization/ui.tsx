"use client";

import { FC } from "react";

import Image, { StaticImageData } from "next/image";

import { ServiceRadialIcon } from "@/shared/assets/icons";
import { cn } from "@/shared/lib/utils";

type Props = {
  className?: string;
  // Локальная иллюстрация (fallback) или URL фото со справочника бэка.
  image?: StaticImageData | string;
  name: string;
  // Значение для next/image sizes — у Главной и поиска плитки разного размера.
  sizes: string;
};

// Заполняет родительский блок (ему нужен position: relative). Специализациям
// без своей иллюстрации достаётся нейтральный значок вместо картинки —
// подставлять чужую было бы хуже, чем не подставлять никакую.
export const SpecializationIllustration: FC<Props> = ({
  image,
  name,
  sizes,
  className,
}) =>
  image ? (
    <Image
      src={image}
      alt={name}
      fill
      sizes={sizes}
      className={cn("object-contain", className)}
    />
  ) : (
    <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-primary-tint">
      <ServiceRadialIcon className="w-1/2 h-1/2 text-primary/60" />
    </span>
  );
