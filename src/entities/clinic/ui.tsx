"use client";

import { FC, useState } from "react";

import { StaticImageData } from "next/image";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { GeoIcon, StarIcon } from "@/shared/assets";
import { ROUTES } from "@/shared/config/routes";

import { ClinicSaveButton } from "./save-button";

type Props = {
  id?: string;
  name: string;
  rating?: number;
  reviews?: number;
  experience: number;
  address: string;
  image?: StaticImageData | string;
  onSave?: () => void;
  initialSaved?: boolean;
  variant?: "vertical" | "horizontal";
};

export const ClinicCard: FC<Props> = ({
  id,
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
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();

  const handleCardClick = () => {
    if (id) router.push(ROUTES.CLINIC_DETAILS(id));
  };

  const stopProp = (e: React.MouseEvent) => e.stopPropagation();

  if (variant === "horizontal") {
    return (
      <div
        className="bg-white rounded-2xl border border-[#E3E4E5] overflow-hidden flex items-stretch w-full cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="relative w-35">
          {image ? (
            <>
              {!loaded && <div className="absolute inset-0 skeleton" />}
              <Image
                src={image}
                alt={name}
                fill
                sizes="140px"
                className="object-cover"
                onLoad={() => setLoaded(true)}
              />
            </>
          ) : (
            <div className="w-full h-full bg-[#F2F3F5]" />
          )}
        </div>
        <div className="p-3 flex-1 min-w-0">
          <p className="font-semibold text-sm text-[#191A1B] truncate">
            {name}
          </p>
          {(rating !== undefined || reviews !== undefined) && (
            <div className="flex items-center gap-1 mt-1 text-xs flex-wrap">
              <StarIcon className="size-3.5 text-[#FFA18D]" />
              {rating !== undefined && (
                <span className="font-medium text-[#FFA18D]">{rating}</span>
              )}
              {reviews !== undefined && (
                <span className="text-[#686F72]">({reviews})</span>
              )}
              <span className="text-[#686F72]">• {experience} лет опыта</span>
            </div>
          )}
          <div className="flex items-center gap-1 mt-1 text-xs text-[#686F72]">
            <GeoIcon className="size-3.5 text-[#F5653E]" />
            <span className="truncate">{address}</span>
          </div>
          <div className="flex justify-end mt-2" onClick={stopProp}>
            <ClinicSaveButton initialSaved={initialSaved} onSave={onSave} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white rounded-3xl border border-[#E3E4E5] w-full h-full flex flex-col p-2 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative w-full h-55 rounded-2xl overflow-hidden">
        {image ? (
          <>
            {!loaded && <div className="absolute inset-0 skeleton" />}
            <Image
              src={image}
              alt={name}
              fill
              sizes="280px"
              className="object-cover"
              onLoad={() => setLoaded(true)}
            />
          </>
        ) : (
          <div className="w-full h-full bg-[#F2F3F5]" />
        )}
        <div className="absolute top-2 right-2" onClick={stopProp}>
          <ClinicSaveButton initialSaved={initialSaved} onSave={onSave} />
        </div>
      </div>

      <div className="p-3">
        <p className="font-semibold text-sm text-[#191A1B] truncate">{name}</p>
        {(rating !== undefined || reviews !== undefined) && (
          <div className="flex items-center gap-1 mt-1 text-xs flex-wrap">
            <StarIcon className="size-3.5 text-[#FFA18D]" />
            {rating !== undefined && (
              <span className="font-medium text-[#FFA18D]">{rating}</span>
            )}
            {reviews !== undefined && (
              <span className="text-[#686F72]">({reviews})</span>
            )}
            <span className="text-[#686F72]">• {experience} лет опыта</span>
          </div>
        )}
        <div className="flex items-center gap-1 mt-1 text-xs text-[#686F72]">
          <GeoIcon className="size-3.5 text-[#F5653E]" />
          <span className="truncate">{address}</span>
        </div>
      </div>
    </div>
  );
};
