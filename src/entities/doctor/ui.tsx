import { FC } from "react";

import { StaticImageData } from "next/image";

import { Button } from "@/shared";

import { StarIcon } from "@/shared/assets";

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
      <div className="bg-white rounded-2xl border border-[#E3E4E5] p-3 flex items-center gap-3 w-full">
        <div className="relative size-20 rounded-2xl overflow-hidden bg-[#FFF8F5]">
          <DoctorPhoto
            image={image}
            name={name}
            sizes="80px"
            fallbackSize="size-8"
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-[#191A1B] leading-snug truncate">
            {name}
          </p>
          <p className="text-xs text-[#686F72] truncate mt-0.5">
            {specialty}
            <span className="text-[#F5653E]"> • {clinic}</span>
          </p>
          {(rating !== undefined || reviews !== undefined) && (
            <div className="flex items-center gap-1 mt-1 text-xs flex-wrap">
              <StarIcon className="size-3.5 fill-[#F5653E] stroke-[#F5653E]" />
              {rating !== undefined && (
                <span className="font-medium text-[#191A1B]">{rating}</span>
              )}
              {reviews !== undefined && (
                <span className="text-[#686F72]">({reviews})</span>
              )}
              <span className="text-[#686F72]">• {experience} лет опыта</span>
            </div>
          )}
          <div className="flex items-center gap-2 mt-2">
            <Button
              variant="outline"
              size="xs"
              className="flex-1 justify-center"
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
          <span className="text-[#F5653E] font-semibold"> • {clinic}</span>
        </p>
        {(rating !== undefined || reviews !== undefined) && (
          <div className="flex items-center gap-1 mt-1 text-xs flex-wrap">
            <StarIcon className="size-3.5 fill-[#F5653E] stroke-[#F5653E]" />
            {rating !== undefined && (
              <span className="font-medium text-[#191A1B]">{rating}</span>
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
