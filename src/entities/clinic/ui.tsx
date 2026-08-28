"use client";

import { FC, useState } from "react";

import { StaticImageData } from "next/image";
import Image from "next/image";
import Link from "next/link";

import { GeoIcon, StarIcon } from "@/shared/assets/icons";
import { ROUTES } from "@/shared/config";
import { useInView } from "@/shared/lib/useInView";
import { formatRating, pluralYears } from "@/shared/lib/utils";
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
  address?: string;
  experience: number;
  id?: string;
  image?: StaticImageData | string;
  isPending?: boolean;
  isSaved?: boolean;
  name: string;
  onSave?: () => void;
  // Для карточек над сгибом (первые в списке) — грузим фото сразу,
  // без ленивой подгрузки, чтобы не задерживать LCP.
  priority?: boolean;
  rating?: number;
  reviews?: number;
  variant?: "horizontal" | "vertical";
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
  isSaved = false,
  isPending = false,
  variant = "vertical",
  priority = false,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  // Не грузим фото клиники, пока карточка не окажется рядом с вьюпортом —
  // важно на страницах с длинными списками (без этого браузер/WebView
  // может начать тянуть фото карточек, до которых пользователь ещё не
  // доскроллил). Карточки с priority (см. выше) эту задержку пропускают.
  const { ref: imgRef, inView } = useInView<HTMLDivElement>();
  const shouldMount = priority || inView;

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
        <div ref={imgRef} className="relative w-35">
          {!image || imageError ? (
            <ClinicImageFallback name={name} />
          ) : !shouldMount ? (
            <div className="absolute inset-0 skeleton" />
          ) : (
            <>
              {!loaded && <div className="absolute inset-0 skeleton" />}
              <Image
                src={image}
                alt={name}
                fill
                sizes="140px"
                className="object-cover"
                priority={priority}
                onLoad={() => setLoaded(true)}
                onError={() => setImageError(true)}
              />
            </>
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
                <span className="font-medium text-[#FFA18D]">
                  {formatRating(rating)}
                </span>
              )}
              {reviews !== undefined && (
                <span className="text-secondary">({reviews})</span>
              )}
              {experience > 0 && (
                <span className="text-secondary">
                  • {experience} {pluralYears(experience)} опыта
                </span>
              )}
            </div>
          )}
          {address && (
            <div className="flex items-center gap-1 mt-1 text-xs text-secondary">
              <GeoIcon className="size-3.5 text-primary" />
              <span className="truncate">{address}</span>
            </div>
          )}
          <div className="flex justify-end mt-2" onClick={stopProp}>
            <SaveButton
              saved={isSaved}
              pending={isPending}
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
      <div
        ref={imgRef}
        className="relative w-full h-55 rounded-2xl overflow-hidden"
      >
        {!image || imageError ? (
          <ClinicImageFallback name={name} />
        ) : !shouldMount ? (
          <div className="absolute inset-0 skeleton" />
        ) : (
          <>
            {!loaded && <div className="absolute inset-0 skeleton" />}
            <Image
              src={image}
              alt={name}
              fill
              sizes="280px"
              className="object-cover"
              priority={priority}
              onLoad={() => setLoaded(true)}
              onError={() => setImageError(true)}
            />
          </>
        )}
        <div className="absolute top-2 right-2" onClick={stopProp}>
          <SaveButton
            saved={isSaved}
            pending={isPending}
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
              <span className="font-medium text-[#FFA18D]">
                {formatRating(rating)}
              </span>
            )}
            {reviews !== undefined && (
              <span className="text-secondary">({reviews})</span>
            )}
            {experience > 0 && (
              <span className="text-secondary">
                • {experience} {pluralYears(experience)} опыта
              </span>
            )}
          </div>
        )}
        {address && (
          <div className="flex items-center gap-1 mt-1 text-xs text-secondary">
            <GeoIcon className="size-3.5 text-primary" />
            <span className="truncate">{address}</span>
          </div>
        )}
      </div>
    </Link>
  );
};
