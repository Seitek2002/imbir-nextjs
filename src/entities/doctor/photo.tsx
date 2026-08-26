"use client";

import { FC, useState } from "react";

import { StaticImageData } from "next/image";

import { UserCircleIcon } from "@/shared/assets/icons";
import { ImageWithFallback } from "@/shared/ui";

type Props = {
  fallbackSize?: string;
  image?: StaticImageData | string;
  name: string;
  sizes?: string;
};

export const DoctorPhoto: FC<Props> = ({
  image,
  name,
  sizes = "220px",
  fallbackSize = "size-16",
}) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="rounded-2xl overflow-hidden bg-primary-tint absolute inset-0">
      {image ? (
        <>
          {!loaded && <div className="absolute inset-0 skeleton" />}
          <ImageWithFallback
            src={image}
            alt={name}
            fill
            sizes={sizes}
            className="object-cover object-top"
            onLoad={() => setLoaded(true)}
            onError={() => setLoaded(true)}
            fallback={
              <div className="w-full h-full flex items-center justify-center">
                <UserCircleIcon className={`${fallbackSize} text-dim`} />
              </div>
            }
          />
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <UserCircleIcon className={`${fallbackSize} text-dim`} />
        </div>
      )}
    </div>
  );
};
