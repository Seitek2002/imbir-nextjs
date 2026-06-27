"use client";

import { FC, useState } from "react";

import { StaticImageData } from "next/image";
import Image from "next/image";
import Link from "next/link";

import { GeoIcon, StarIcon } from "@/shared/assets/icons";
import { ROUTES } from "@/shared/config";
import { SaveButton } from "@/shared/ui";

const getInitials = (name: string) =>
  name
    .replace(/[«»""]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

const ClinicImageFallback: FC<{ name: string }> = ({ name }) => (
  <div className="w-full h-full bg-linear-to-br from-[#FFF2F0] to-[#FFD9CC] flex flex-col items-center justify-center gap-2 p-3">
    <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shrink-0">
      <span className="text-white font-bold text-lg leading-none">
        {getInitials(name)}
      </span>
    </div>
    <p className="text-primary text-xs font-medium text-center line-clamp-2 leading-tight">
      {name}
    </p>
  </div>
);

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
  const [imageError, setImageError] = useState(false);

  const href = id ? ROUTES.CLINIC_DETAILS(id) : "/";
  const stopProp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  if (variant === "horizontal") {
    return (
      <Link
        href={href}
        className="bg-white rounded-2xl border border-border-soft overflow-hidden flex items-stretch w-full cursor-pointer hover:border-primary/40 transition-colors"
      >
        <div className="relative w-35">
          {image && !imageError ? (
            <>
              {!loaded && <div className="absolute inset-0 skeleton" />}
              <Image
                src={image}
                alt={name}
                fill
                sizes="140px"
                className="object-cover"
                onLoad={() => setLoaded(true)}
                onError={() => setImageError(true)}
              />
            </>
          ) : (
            <ClinicImageFallback name={name} />
          )}
        </div>
        <div className="p-3 flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground truncate">
            {name}
          </p>
          {(rating !== undefined || reviews !== undefined) && (
            <div className="flex items-center gap-1 mt-1 text-xs flex-wrap">
              <StarIcon className="size-3.5 text-[#FFA18D]" />
              {rating !== undefined && (
                <span className="font-medium text-[#FFA18D]">{rating}</span>
              )}
              {reviews !== undefined && (
                <span className="text-secondary">({reviews})</span>
              )}
              {experience > 0 && (
                <span className="text-secondary">• {experience} лет опыта</span>
              )}
            </div>
          )}
          <div className="flex items-center gap-1 mt-1 text-xs text-secondary">
            <GeoIcon className="size-3.5 text-primary" />
            <span className="truncate">{address}</span>
          </div>
          <div className="flex justify-end mt-2" onClick={stopProp}>
            <SaveButton
              initialSaved={initialSaved}
              onSave={onSave}
              unsavedLabel="Сохранить клинику"
            />
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="bg-white rounded-3xl border border-border-soft w-full h-full flex flex-col p-2 cursor-pointer hover:border-primary/40 transition-colors"
    >
      <div className="relative w-full h-55 rounded-2xl overflow-hidden">
        {image && !imageError ? (
          <>
            {!loaded && <div className="absolute inset-0 skeleton" />}
            <Image
              src={image}
              alt={name}
              fill
              sizes="280px"
              className="object-cover"
              onLoad={() => setLoaded(true)}
              onError={() => setImageError(true)}
            />
          </>
        ) : (
          <ClinicImageFallback name={name} />
        )}
        <div className="absolute top-2 right-2" onClick={stopProp}>
          <SaveButton
            initialSaved={initialSaved}
            onSave={onSave}
            unsavedLabel="Сохранить клинику"
          />
        </div>
      </div>

      <div className="p-3">
        <p className="font-semibold text-sm text-foreground truncate">{name}</p>
        {(rating !== undefined || reviews !== undefined) && (
          <div className="flex items-center gap-1 mt-1 text-xs flex-wrap">
            <StarIcon className="size-3.5 text-[#FFA18D]" />
            {rating !== undefined && (
              <span className="font-medium text-[#FFA18D]">{rating}</span>
            )}
            {reviews !== undefined && (
              <span className="text-secondary">({reviews})</span>
            )}
            {experience > 0 && (
              <span className="text-secondary">• {experience} лет опыта</span>
            )}
          </div>
        )}
        <div className="flex items-center gap-1 mt-1 text-xs text-secondary">
          <GeoIcon className="size-3.5 text-primary" />
          <span className="truncate">{address}</span>
        </div>
      </div>
    </Link>
  );
};
