"use client";

import { FC, useState } from "react";

import Image, { StaticImageData } from "next/image";

import { Button, IconBtn } from "@/shared";

import { HeartIcon, StarIcon, UserCircleIcon } from "@/shared/assets";

type Props = {
  name: string;
  specialty: string;
  clinic: string;
  rating: number;
  reviews: number;
  experience: number;
  image?: StaticImageData | string;
  onBook?: () => void;
  onSave?: () => void;
  initialSaved?: boolean;
  variant?: "vertical" | "horizontal";
};

export const DoctorCard: FC<Props> = ({
  name,
  specialty,
  clinic,
  rating,
  reviews,
  experience,
  image,
  onBook,
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
      aria-label={saved ? "Убрать из сохранённых" : "Сохранить врача"}
      className="size-8 shrink-0 flex items-center justify-center bg-white border-[#E5E6E8]"
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
    <div className="flex flex-col gap-0.5 min-w-0">
      <p
        className="font-semibold text-sm text-[#191A1B] leading-snug overflow-hidden"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}
      >
        {name}
      </p>
      <p className="text-xs text-[#686F72] truncate">
        {specialty}
        <span className="text-[#F5653E]"> • {clinic}</span>
      </p>
      <div className="flex items-center gap-1 mt-0.5 text-xs text-[#191A1B] flex-wrap">
        <StarIcon className="size-3.5 fill-[#F5653E] stroke-[#F5653E] shrink-0" />
        <span className="font-medium shrink-0">{rating}</span>
        <span className="text-[#686F72] shrink-0">({reviews})</span>
        <span className="text-[#686F72] shrink-0">
          • {experience} лет опыта
        </span>
      </div>
    </div>
  );

  if (variant === "horizontal") {
    return (
      <div className="bg-white rounded-2xl p-3 flex items-center gap-3 w-full">
        <div className="relative size-20 shrink-0 rounded-2xl overflow-hidden bg-[#FFF8F5]">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              sizes="80px"
              className="object-cover object-top"
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0iI0YyRjNGNSIvPjwvc3ZnPg=="
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <UserCircleIcon className="size-8 text-[#C4C8CA]" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 flex-1 min-w-0">
          {info}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="xs"
              className="flex-1 justify-center"
              onClick={onBook}
            >
              Записаться
            </Button>
            {heartBtn}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl p-3 flex flex-col gap-3 w-full h-full">
      <div className="relative aspect-square w-full">
        <div className="rounded-2xl overflow-hidden bg-[#FFF8F5] absolute inset-0">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              sizes="220px"
              className="object-cover object-top"
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjIwIiBoZWlnaHQ9IjIyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRjJGM0Y1Ii8+PC9zdmc+"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <UserCircleIcon className="size-16 text-[#C4C8CA]" />
            </div>
          )}
        </div>
        <div className="absolute top-2 right-2 z-10">{heartBtn}</div>
      </div>

      <div className="flex flex-col gap-0.5 px-1 min-w-0 flex-1">{info}</div>

      <Button
        variant="outline"
        size="sm"
        className="w-full justify-center"
        onClick={onBook}
      >
        Записаться
      </Button>
    </div>
  );
};
