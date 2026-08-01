"use client";

import { FC, useState } from "react";

import { StaticImageData } from "next/image";
import Link from "next/link";

import { StarIcon, UserCircleIcon } from "@/shared/assets/icons";
import { ROUTES } from "@/shared/config";
import { Workplace } from "@/shared/dummies";
import { useAuthStore } from "@/shared/store";
import { Button, ImageWithFallback, SaveButton } from "@/shared/ui";

import { DoctorPhoto } from "./photo";

type Props = {
  id?: string | number;
  name: string;
  specialty: string;
  workplaces: Workplace[];
  rating?: number;
  reviews?: number;
  experience: number;
  image?: StaticImageData | string;
  onBook?: () => void;
  onSave?: () => void;
  isSaved?: boolean;
  variant?: "vertical" | "horizontal";
};

export const DoctorCard: FC<Props> = ({
  id,
  name,
  specialty,
  workplaces,
  rating,
  reviews,
  experience,
  image,
  onBook,
  onSave,
  isSaved = false,
  variant = "vertical",
}) => {
  const [loaded, setLoaded] = useState(false);
  const user = useAuthStore((s) => s.user);
  const isDoctor = user?.role === "doctor";

  // Места работы может не быть (напр. карточка из избранного) — тогда просто
  // не дорисовываем клинику к специальности.
  const primaryClinic = workplaces[0]?.clinicName;
  const additionalClinicsCount = workplaces.length - 1;

  const href = id ? ROUTES.SPECIALIST_DETAILS(id) : "/";
  const stopProp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  if (variant === "horizontal") {
    return (
      <Link
        href={href}
        className="bg-white rounded-2xl border border-border-soft p-2.5 flex items-stretch gap-2.5 w-full cursor-pointer hover:border-primary/40 transition-colors"
      >
        <div className="relative w-30 min-w-30 self-stretch rounded-2xl overflow-hidden bg-primary-tint">
          {image ? (
            <>
              {!loaded && <div className="absolute inset-0 skeleton" />}
              <ImageWithFallback
                src={image}
                alt={name}
                fill
                sizes="120px"
                className="object-cover object-top scale-110"
                onLoad={() => setLoaded(true)}
                onError={() => setLoaded(true)}
                fallback={
                  <div className="w-full h-full flex items-center justify-center">
                    <UserCircleIcon className="size-10 text-dim" />
                  </div>
                }
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <UserCircleIcon className="size-10 text-dim" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0 py-0.5 flex flex-col">
          <p className="font-semibold text-[18px] text-foreground leading-tight truncate">
            {name}
          </p>

          <p className="text-[14px] text-secondary truncate mt-1">
            {specialty}
            {primaryClinic && (
              <span className="text-primary">
                {" "}
                • {primaryClinic}{" "}
                {additionalClinicsCount > 0 &&
                  `+ еще ${additionalClinicsCount}`}
              </span>
            )}
          </p>

          {(rating !== undefined || reviews !== undefined) && (
            <div className="flex items-center gap-1 mt-1.5 text-[14px] flex-wrap">
              <StarIcon className="size-4 text-[#FF7C63]" />
              {rating !== undefined && (
                <span className="font-medium text-[#FF7C63]">{rating}</span>
              )}
              {reviews !== undefined && (
                <span className="text-secondary">({reviews})</span>
              )}
              <span className="text-secondary">• {experience} лет опыта</span>
            </div>
          )}

          <div className="mt-auto pt-2 flex items-center gap-2">
            {!isDoctor && (
              <Button
                variant="outline"
                size="xs"
                className="flex-1 justify-center text-[16px] py-2"
                onClick={(e) => {
                  stopProp(e);
                  onBook?.();
                }}
              >
                Записаться
              </Button>
            )}
            <div onClick={stopProp}>
              <SaveButton
                saved={isSaved}
                onSave={onSave}
                unsavedLabel="Сохранить врача"
              />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="bg-white rounded-3xl border border-border-soft p-2 w-full h-full flex flex-col relative cursor-pointer hover:border-primary/40 transition-colors"
    >
      <div className="relative aspect-square w-full">
        <DoctorPhoto image={image} name={name} />
        <div className="absolute top-2 right-2 z-10" onClick={stopProp}>
          <SaveButton
            saved={isSaved}
            onSave={onSave}
            unsavedLabel="Сохранить врача"
          />
        </div>
      </div>

      <div className="flex-1 px-1 mt-3">
        <p className="font-semibold text-sm text-foreground leading-snug truncate">
          {name}
        </p>
        <p className="text-xs text-secondary truncate mt-0.5">
          {specialty}
          {primaryClinic && (
            <span className="text-primary">
              {" "}
              • {primaryClinic}{" "}
              {additionalClinicsCount > 0 && `+${additionalClinicsCount}`}
            </span>
          )}
        </p>
        {(rating !== undefined || reviews !== undefined) && (
          <div className="flex items-center gap-1 mt-1 text-xs flex-wrap">
            <StarIcon className="size-3.5 text-[#FF7C63]" />
            {rating !== undefined && (
              <span className="font-medium text-[#FF7C63]">{rating}</span>
            )}
            {reviews !== undefined && (
              <span className="text-secondary">({reviews})</span>
            )}
            <span className="text-secondary">• {experience} лет</span>
          </div>
        )}
      </div>

      {!isDoctor && (
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-center mt-3"
          onClick={(e) => {
            stopProp(e);
            onBook?.();
          }}
        >
          Записаться
        </Button>
      )}
    </Link>
  );
};
