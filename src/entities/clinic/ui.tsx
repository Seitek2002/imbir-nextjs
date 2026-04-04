"use client";

import { FC, useState } from "react";

import Image, { StaticImageData } from "next/image";

import { IconBtn } from "@/shared";

import { GeoIcon, HeartIcon, StarIcon } from "@/shared/assets";

type Props = {
  name: string;
  rating: number;
  reviews: number;
  experience: number;
  address: string;
  image?: StaticImageData | string;
  onSave?: () => void;
  initialSaved?: boolean;
  variant?: "vertical" | "horizontal";
};

export const ClinicCard: FC<Props> = ({
  name,
  rating,
  reviews,
  experience,
  address,
  image,
  onSave,
  initialSaved = false,
  variant = "vertical",
}) => {
  const [saved, setSaved] = useState(initialSaved);

  const handleSave = () => {
    setSaved((prev) => !prev);
    onSave?.();
  };

  const heartBtn = (
    <IconBtn
      variant="outline"
      size="xs"
      onClick={handleSave}
      aria-label={saved ? "Убрать из сохранённых" : "Сохранить клинику"}
      className="size-8 shrink-0 flex items-center justify-center bg-white border-[#E5E6E8] hover:bg-white"
    >
      <HeartIcon
        className={
          saved
            ? "size-4 fill-[#F5653E] stroke-[#F5653E] transition-colors"
            : "size-4 stroke-[#F5653E] transition-colors"
        }
      />
    </IconBtn>
  );

  const info = (
    <div className="flex flex-col gap-1 min-w-0">
      <p className="font-semibold text-sm text-[#191A1B] truncate">{name}</p>
      <div className="flex items-center gap-1 text-xs text-[#191A1B] flex-wrap">
        <StarIcon className="size-3.5 fill-[#F5653E] stroke-[#F5653E] shrink-0" />
        <span className="font-medium shrink-0">{rating}</span>
        <span className="text-[#686F72] shrink-0">({reviews})</span>
        <span className="text-[#686F72] shrink-0">
          • {experience} лет опыта
        </span>
      </div>
      <div className="flex items-center gap-1 text-xs text-[#686F72]">
        <GeoIcon className="size-3.5 shrink-0 stroke-[#686F72]" />
        <span className="truncate">{address}</span>
      </div>
    </div>
  );

  if (variant === "horizontal") {
    return (
      <div className="bg-white rounded-2xl border border-[#E3E4E5] overflow-hidden flex items-stretch w-full">
        <div className="relative w-35 shrink-0">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              sizes="140px"
              className="object-cover"
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTQwIiBoZWlnaHQ9IjEwNSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRjJGM0Y1Ii8+PC9zdmc+"
            />
          ) : (
            <div className="w-full h-full bg-[#F2F3F5]" />
          )}
        </div>
        <div className="flex flex-col justify-between gap-2 p-3 flex-1 min-w-0">
          {info}
          <div className="flex justify-end">{heartBtn}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-[#E3E4E5] overflow-hidden flex flex-col w-full">
      <div className="relative aspect-4/3 w-full">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="280px"
            className="object-cover"
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjgwIiBoZWlnaHQ9IjIxMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRjJGM0Y1Ii8+PC9zdmc+"
          />
        ) : (
          <div className="w-full h-full bg-[#F2F3F5]" />
        )}
        <div className="absolute top-2 right-2">{heartBtn}</div>
      </div>
      <div className="p-3">{info}</div>
    </div>
  );
};
