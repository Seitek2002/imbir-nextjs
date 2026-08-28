"use client";

import { FC } from "react";

import { StaticImageData } from "next/image";

import { UserCircleIcon } from "@/shared/assets/icons";
import { ImageWithFallback } from "@/shared/ui";

type Props = {
  fallbackSize?: string;
  image?: StaticImageData | string;
  name: string;
  // Первая карточка списка — она же LCP-элемент страницы. Ленивая загрузка
  // откладывала её до конца гидратации, и LCP уезжал на секунду.
  priority?: boolean;
  sizes?: string;
};

export const DoctorPhoto: FC<Props> = ({
  image,
  name,
  priority = false,
  sizes = "220px",
  fallbackSize = "size-16",
}) => {
  return (
    <div className="rounded-2xl overflow-hidden bg-primary-tint absolute inset-0">
      {image ? (
        <ImageWithFallback
          src={image}
          alt={name}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover object-top"
          fallback={
            <div className="w-full h-full flex items-center justify-center">
              <UserCircleIcon className={`${fallbackSize} text-dim`} />
            </div>
          }
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <UserCircleIcon className={`${fallbackSize} text-dim`} />
        </div>
      )}
    </div>
  );
};
