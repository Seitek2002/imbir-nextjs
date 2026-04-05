import { FC } from "react";

import Image, { StaticImageData } from "next/image";

import { Button } from "@/shared";

import { StarIcon, UserCircleIcon } from "@/shared/assets";

import { DoctorPhoto } from "./photo";
import { DoctorSaveButton } from "./save-button";

type Props = {
  name: string;
  specialty: string;
  clinic: string;
  rating?: number;
  reviews?: number;
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
  if (variant === "horizontal") {
    return (
      <div className="bg-white rounded-2xl border border-[#E3E4E5] p-2.5 flex items-stretch gap-2.5 w-full">
        <div className="relative w-30 min-w-30 self-stretch rounded-2xl overflow-hidden bg-[#FFF8F5]">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              sizes="120px"
              className="object-cover object-top scale-110"
              placeholder="blur"
              blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEzMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRjJGM0Y1Ii8+PC9zdmc+"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <UserCircleIcon className="size-10 text-[#C4C8CA]" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 py-0.5">
          <p className="font-semibold text-[18px] text-[#191A1B] leading-tight truncate">
            {name}
          </p>
          <p className="text-[14px] text-[#686F72] truncate mt-1">
            {specialty}
            <span className="text-[#F5653E]"> • {clinic}</span>
          </p>

          {(rating !== undefined || reviews !== undefined) && (
            <div className="flex items-center gap-1 mt-1.5 text-[14px] flex-wrap">
              <StarIcon className="size-4 text-[#FF7C63]" />
              {rating !== undefined && (
                <span className="font-medium text-[#FF7C63]">{rating}</span>
              )}
              {reviews !== undefined && (
                <span className="text-[#686F72]">({reviews})</span>
              )}
              <span className="text-[#686F72]">• {experience} лет опыта</span>
            </div>
          )}

          <div className="flex items-center gap-2 mt-2.5">
            <Button
              variant="outline"
              size="xs"
              className="flex-1 justify-center text-[16px] py-2"
              onClick={onBook}
            >
              Записаться
            </Button>
            <DoctorSaveButton initialSaved={initialSaved} onSave={onSave} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl border border-[#E3E4E5] p-2 w-full h-full flex flex-col">
      <div className="relative aspect-square w-full">
        <DoctorPhoto image={image} name={name} />
        <div className="absolute top-2 right-2 z-10">
          <DoctorSaveButton initialSaved={initialSaved} onSave={onSave} />
        </div>
      </div>

      <div className="flex-1 px-1 mt-3">
        <p className="font-semibold text-sm text-[#191A1B] leading-snug truncate">
          {name}
        </p>
        <p className="text-xs text-[#686F72] truncate mt-0.5">
          {specialty}
          <span className="text-[#F5653E]"> • {clinic}</span>
        </p>
        {(rating !== undefined || reviews !== undefined) && (
          <div className="flex items-center gap-1 mt-1 text-xs flex-wrap">
            <StarIcon className="size-3.5 text-[#FF7C63]" />
            {rating !== undefined && (
              <span className="font-medium text-[#FF7C63]">{rating}</span>
            )}
            {reviews !== undefined && (
              <span className="text-[#686F72]">({reviews})</span>
            )}
            <span className="text-[#686F72]">• {experience} лет опыта</span>
          </div>
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full justify-center mt-3"
        onClick={onBook}
      >
        Записаться
      </Button>
    </div>
  );
};
