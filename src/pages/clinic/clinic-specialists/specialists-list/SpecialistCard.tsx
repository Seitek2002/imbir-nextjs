"use client";

import { FC, useState } from "react";

import Link from "next/link";

import { CloseIcon, StarIcon, UserCircleIcon } from "@/shared/assets/icons";
import { pluralYears } from "@/shared/lib/utils";
import { ImageWithFallback } from "@/shared/ui";

// Заглушки на время загрузки списка — тех же размеров, что настоящие
// карточка/строка, чтобы во время подгрузки не мигало "Специалистов пока
// нет" (пустой стейт) там, где на самом деле просто ещё не пришёл ответ.
export const SpecialistCardSkeleton: FC = () => (
  <div className="bg-white rounded-3xl border border-border-soft p-2">
    <div className="aspect-square w-full rounded-2xl skeleton mb-3" />
    <div className="px-1 flex flex-col gap-2">
      <div className="h-4 w-3/4 rounded-md skeleton" />
      <div className="h-3.5 w-1/2 rounded-md skeleton" />
      <div className="h-3.5 w-2/3 rounded-md skeleton" />
    </div>
  </div>
);

export const SpecialistRowSkeleton: FC = () => (
  <div className="flex items-center gap-3 bg-white rounded-2xl border border-border-soft p-3">
    <div className="w-14 h-14 rounded-xl skeleton shrink-0" />
    <div className="flex-1 flex flex-col gap-2">
      <div className="h-3.5 w-2/3 rounded-md skeleton" />
      <div className="h-3 w-1/2 rounded-md skeleton" />
      <div className="h-3 w-1/3 rounded-md skeleton" />
    </div>
  </div>
);

export type Specialist = {
  clinic: string;
  experience: number;
  id: string;
  image?: string;
  name: string;
  rating: number;
  reviews: number;
  specialty: string;
};

type Props = Specialist & {
  onDelete?: (id: string) => void;
};

const DeleteButton: FC<{
  className?: string;
  onClick: (e: React.MouseEvent) => void;
}> = ({ onClick, className }) => (
  <button
    onClick={onClick}
    className={`z-10 rounded-full bg-white border border-border flex items-center justify-center hover:bg-primary-tint hover:border-primary transition-colors shrink-0 ${className ?? ""}`}
    aria-label="Удалить"
  >
    <CloseIcon className="size-4 text-secondary" />
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
  const specialtyLabel = specialty || "Специализация не указана";

  return (
    <div className="bg-white rounded-3xl border border-border-soft p-2 relative">
      {onDelete && (
        <DeleteButton
          onClick={() => onDelete(id)}
          className="absolute top-4 right-4 w-8 h-8"
        />
      )}

      <Link href={`/clinic-profile/specialists/${id}`}>
        {/* Photo */}
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-primary-tint mb-3">
          {image ? (
            <>
              {!loaded && <div className="absolute inset-0 skeleton" />}
              <ImageWithFallback
                src={image}
                alt={name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                className="object-cover object-top scale-110"
                onLoad={() => setLoaded(true)}
                onError={() => setLoaded(true)}
                fallback={
                  <div className="w-full h-full flex items-center justify-center">
                    <UserCircleIcon className="size-20 text-dim" />
                  </div>
                }
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
            {specialtyLabel} <span className="text-primary">• {clinic}</span>
          </p>

          <div className="flex items-center gap-1 text-sm flex-wrap">
            {/* Без отзывов рейтинга не существует: «0.00 (0)» читается как
                самая низкая оценка, а не как «ещё не оценивали». */}
            {reviews > 0 && (
              <>
                <StarIcon className="w-4 h-4 text-primary" />
                <span className="font-medium text-primary">{rating}</span>
                <span className="text-muted">({reviews}) •</span>
              </>
            )}
            <span className="text-muted">
              {experience} {pluralYears(experience)} опыта
            </span>
          </div>
        </div>
      </Link>
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
}) => {
  const specialtyLabel = specialty || "Специализация не указана";

  return (
    <Link
      href={`/clinic-profile/specialists/${id}`}
      className="flex items-center gap-3 bg-white rounded-2xl border border-border-soft p-3"
    >
      <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-primary-tint shrink-0">
        {image ? (
          <ImageWithFallback
            src={image}
            alt={name}
            fill
            sizes="56px"
            className="object-cover object-top"
            fallback={
              <div className="w-full h-full flex items-center justify-center">
                <UserCircleIcon className="size-8 text-dim" />
              </div>
            }
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <UserCircleIcon className="size-8 text-dim" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm text-foreground truncate">
          {name}
        </h3>
        <p className="text-xs text-muted truncate mt-0.5">
          {specialtyLabel} <span className="text-primary">• {clinic}</span>
        </p>
        <div className="flex items-center gap-1 text-xs mt-1 flex-wrap">
          {reviews > 0 && (
            <>
              <StarIcon className="w-3.5 h-3.5 text-primary" />
              <span className="font-medium text-primary">{rating}</span>
              <span className="text-muted">({reviews}) •</span>
            </>
          )}
          <span className="text-muted">
            {experience} {pluralYears(experience)} опыта
          </span>
        </div>
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
};
