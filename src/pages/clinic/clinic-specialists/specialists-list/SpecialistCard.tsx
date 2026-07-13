"use client";

import { FC, useState } from "react";

import Image from "next/image";

import { StarIcon, UserCircleIcon } from "@/shared/assets/icons";
import { colors } from "@/shared/config";

export type Specialist = {
  id: string;
  name: string;
  specialty: string;
  clinic: string;
  rating: number;
  reviews: number;
  experience: number;
  image?: string;
};

type Props = Specialist & {
  onDelete?: (id: string) => void;
};

const DeleteButton: FC<{ onClick: () => void; className?: string }> = ({
  onClick,
  className,
}) => (
  <button
    onClick={onClick}
    className={`z-10 rounded-full bg-white border border-border flex items-center justify-center hover:bg-primary-tint hover:border-primary transition-colors shrink-0 ${className ?? ""}`}
    aria-label="Удалить"
  >
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M12 4L4 12M4 4L12 12"
        stroke={colors.secondary}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  </button>
);

export const SpecialistCard: FC<Props> = ({
  id,
  name,
  specialty,
  clinic,
  rating,
  reviews,
  experience,
  image,
  onDelete,
}) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="bg-white rounded-3xl border border-border-soft p-2 relative">
      {onDelete && (
        <DeleteButton
          onClick={() => onDelete(id)}
          className="absolute top-4 right-4 w-8 h-8"
        />
      )}

      {/* Photo */}
      <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-primary-tint mb-3">
        {image ? (
          <>
            {!loaded && <div className="absolute inset-0 skeleton" />}
            <Image
              src={image}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
              className="object-cover object-top scale-110"
              onLoad={() => setLoaded(true)}
            />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <UserCircleIcon className="size-20 text-dim" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-1">
        <h3 className="font-semibold text-base text-foreground leading-tight truncate mb-1">
          {name}
        </h3>
        <p className="text-sm text-muted truncate mb-2">
          {specialty} <span className="text-primary">• {clinic}</span>
        </p>

        <div className="flex items-center gap-1 text-sm flex-wrap">
          <StarIcon className="w-4 h-4 text-primary" />
          <span className="font-medium text-primary">{rating}</span>
          <span className="text-muted">({reviews})</span>
          <span className="text-muted">• {experience} лет опыта</span>
        </div>
      </div>
    </div>
  );
};

// Компактная строка для мобильного списка (мокап: маленький аватар + текст в
// одну строку, без крупного фото карточки).
export const SpecialistRow: FC<Props> = ({
  id,
  name,
  specialty,
  clinic,
  rating,
  reviews,
  experience,
  image,
  onDelete,
}) => (
  <div className="flex items-center gap-3 bg-white rounded-2xl border border-border-soft p-3">
    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-primary-tint shrink-0">
      {image ? (
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover object-top"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <UserCircleIcon className="size-8 text-dim" />
        </div>
      )}
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="font-semibold text-sm text-foreground truncate">{name}</h3>
      <p className="text-xs text-muted truncate mt-0.5">
        {specialty} <span className="text-primary">• {clinic}</span>
      </p>
      <div className="flex items-center gap-1 text-xs mt-1 flex-wrap">
        <StarIcon className="w-3.5 h-3.5 text-primary" />
        <span className="font-medium text-primary">{rating}</span>
        <span className="text-muted">
          ({reviews}) • {experience} лет опыта
        </span>
      </div>
    </div>
    {onDelete && (
      <DeleteButton onClick={() => onDelete(id)} className="w-8 h-8" />
    )}
  </div>
);
