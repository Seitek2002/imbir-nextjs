"use client";

import { FC, useState } from "react";

import Image from "next/image";
import Link from "next/link";

import { StarIcon } from "@/shared/assets/icons";
import { colors } from "@/shared/config";

type Props = {
  id: string;
  name: string;
  category: string;
  clinic: string;
  price: number;
  image?: string;
  reviews?: number;
  onDelete?: (id: string) => void;
};

const DeleteButton: FC<{
  onClick: (e: React.MouseEvent) => void;
  className?: string;
}> = ({ onClick, className }) => (
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

const PlaceholderPhoto: FC<{ className?: string }> = ({ className }) => (
  <svg
    width="80"
    height="80"
    viewBox="0 0 80 80"
    fill="none"
    className={className}
  >
    <rect width="80" height="80" fill={colors.surface} />
    <path
      d="M40 20C28.96 20 20 28.96 20 40C20 51.04 28.96 60 40 60C51.04 60 60 51.04 60 40C60 28.96 51.04 20 40 20Z"
      fill={colors.border}
    />
  </svg>
);

export const ProcedureCard: FC<Props> = ({
  id,
  name,
  category,
  clinic,
  price,
  image,
  reviews,
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

      <Link href={`/clinic-profile/procedures/${id}`}>
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
                className="object-cover"
                onLoad={() => setLoaded(true)}
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <PlaceholderPhoto />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="px-1">
          <h3 className="font-semibold text-base text-foreground leading-tight truncate mb-1">
            {name}
          </h3>
          <p className="text-sm text-muted truncate mb-2">
            {category} <span className="text-primary">• {clinic}</span>
          </p>

          <div className="flex items-center justify-between">
            <span className="text-foreground font-semibold text-base">
              {price} с
            </span>
            {reviews && (
              <div className="flex items-center gap-1 text-sm">
                <StarIcon className="w-4 h-4 text-primary" />
                <span className="text-muted">({reviews})</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

// Компактная строка для мобильного списка — тот же паттерн, что у
// специалистов (SpecialistRow), т.к. страницы очень похожи по структуре.
export const ProcedureRow: FC<Props> = ({
  id,
  name,
  category,
  clinic,
  price,
  image,
  reviews,
  onDelete,
}) => (
  <Link
    href={`/clinic-profile/procedures/${id}`}
    className="flex items-center gap-3 bg-white rounded-2xl border border-border-soft p-3"
  >
    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-primary-tint shrink-0">
      {image ? (
        <Image src={image} alt={name} fill className="object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <PlaceholderPhoto className="w-8 h-8" />
        </div>
      )}
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-sm text-foreground truncate">
          {name}
        </h3>
        <span className="text-foreground font-semibold text-sm shrink-0">
          {price} с
        </span>
      </div>
      <p className="text-xs text-muted truncate mt-0.5">
        {category} <span className="text-primary">• {clinic}</span>
      </p>
      {!!reviews && (
        <div className="flex items-center gap-1 text-xs mt-1">
          <StarIcon className="w-3.5 h-3.5 text-primary" />
          <span className="text-muted">({reviews})</span>
        </div>
      )}
    </div>
    {onDelete && (
      <DeleteButton
        onClick={(e) => {
          e.preventDefault();
          onDelete(id);
        }}
        className="w-8 h-8"
      />
    )}
  </Link>
);
