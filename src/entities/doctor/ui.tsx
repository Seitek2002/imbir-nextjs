"use client";

import { FC, useState } from "react";

import Image, { StaticImageData } from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "@/shared";

import { StarIcon, UserCircleIcon } from "@/shared/assets";
import { ROUTES } from "@/shared/config/routes";
import { Workplace } from "@/shared/constants/mocks";

import { DoctorPhoto } from "./photo";
import { DoctorSaveButton } from "./save-button";

type Props = {
  id?: string | number;
  name: string;
  specialty: string;
  workplaces: Workplace[];
  isOnlineAvailable?: boolean;
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
  id,
  name,
  specialty,
  workplaces,
  isOnlineAvailable,
  rating,
  reviews,
  experience,
  image,
  onBook,
  onSave,
  initialSaved = false,
  variant = "vertical",
}) => {
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();

  const handleCardClick = () => {
    if (id) router.push(ROUTES.SPECIALIST_DETAILS(id));
  };

  const stopProp = (e: React.MouseEvent) => e.stopPropagation();

  // Вычисляем логику для отображения клиник и цен
  const primaryClinic = workplaces[0]?.clinicName || "Не указана";
  const additionalClinicsCount = workplaces.length - 1;
  const minPrice =
    workplaces.length > 0 ? Math.min(...workplaces.map((w) => w.price)) : null;

  if (variant === "horizontal") {
    return (
      <div
        className="bg-white rounded-2xl border border-[#E3E4E5] p-2.5 flex items-stretch gap-2.5 w-full cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="relative w-30 min-w-30 self-stretch rounded-2xl overflow-hidden bg-[#FFF8F5]">
          {image ? (
            <>
              {!loaded && <div className="absolute inset-0 skeleton" />}
              <Image
                src={image}
                alt={name}
                fill
                sizes="120px"
                className="object-cover object-top scale-110"
                onLoad={() => setLoaded(true)}
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <UserCircleIcon className="size-10 text-[#C4C8CA]" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 py-0.5 flex flex-col">
          <div className="flex items-start justify-between gap-2">
            <p className="font-semibold text-[18px] text-[#191A1B] leading-tight truncate">
              {name}
            </p>
            {isOnlineAvailable && (
              <span className="shrink-0-0 bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                Онлайн
              </span>
            )}
          </div>

          <p className="text-[14px] text-[#686F72] truncate mt-1">
            {specialty}
            <span className="text-[#F5653E]">
              {" "}
              • {primaryClinic}{" "}
              {additionalClinicsCount > 0 && `+ еще ${additionalClinicsCount}`}
            </span>
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

          <div
            className="mt-auto pt-2 flex items-center gap-2"
            onClick={stopProp}
          >
            <Button
              variant="outline"
              size="xs"
              className="flex-1 justify-center text-[16px] py-2"
              onClick={onBook}
            >
              Записаться{" "}
              {minPrice && (
                <span className="ml-1 text-sm font-normal opacity-80">
                  от {minPrice} с
                </span>
              )}
            </Button>
            <DoctorSaveButton initialSaved={initialSaved} onSave={onSave} />
          </div>
        </div>
      </div>
    );
  }

  // VERTICAL VARIANT
  return (
    <div
      className="bg-white rounded-3xl border border-[#E3E4E5] p-2 w-full h-full flex flex-col relative cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Бейджик онлайна поверх фото */}
      {isOnlineAvailable && (
        <div className="absolute top-4 left-4 z-20 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase tracking-wider">
          Онлайн
        </div>
      )}

      <div className="relative aspect-square w-full">
        <DoctorPhoto image={image} name={name} />
        <div className="absolute top-2 right-2 z-10" onClick={stopProp}>
          <DoctorSaveButton initialSaved={initialSaved} onSave={onSave} />
        </div>
      </div>

      <div className="flex-1 px-1 mt-3">
        <p className="font-semibold text-sm text-[#191A1B] leading-snug truncate">
          {name}
        </p>
        <p className="text-xs text-[#686F72] truncate mt-0.5">
          {specialty}
          <span className="text-[#F5653E]">
            {" "}
            • {primaryClinic}{" "}
            {additionalClinicsCount > 0 && `+${additionalClinicsCount}`}
          </span>
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
            <span className="text-[#686F72]">• {experience} лет</span>
          </div>
        )}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full justify-center mt-3"
        onClick={(e) => {
          e.stopPropagation();
          onBook?.();
        }}
      >
        Записаться{" "}
        {minPrice && (
          <span className="ml-1 opacity-70 font-normal">от {minPrice} с</span>
        )}
      </Button>
    </div>
  );
};
