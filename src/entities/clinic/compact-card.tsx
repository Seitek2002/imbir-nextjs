"use client";

import { FC } from "react";

import Link from "next/link";

import { StarIcon } from "@/shared/assets/icons";
import { ROUTES } from "@/shared/config";
import { formatRating } from "@/shared/lib/utils";
import { useAuthStore } from "@/shared/store";
import { Button, ImageWithFallback } from "@/shared/ui";

type Props = {
  city?: string;
  id: number | string;
  logo?: null | string;
  name: string;
  onBook?: () => void;
  rating?: number | string;
};

const getInitials = (name: string) =>
  name
    .replace(/[«»""]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

// Уменьшенная версия ClinicCard — для мест, где нужен узнаваемый вид
// карточки клиники, но в компактной обвязке (напр. рекомендации ИИ-чата).
// В отличие от полноразмерной ClinicCard, тут есть «Записаться» — прямая
// ссылка на /record с уже подставленной клиникой.
export const ClinicCompactCard: FC<Props> = ({
  id,
  name,
  logo,
  city,
  rating,
  onBook,
}) => {
  const user = useAuthStore((s) => s.user);
  const isDoctor = user?.role === "doctor";

  const stopProp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <Link
      href={ROUTES.CLINIC_DETAILS(id)}
      className="w-40 shrink-0 bg-white rounded-2xl border border-border-soft p-2 flex flex-col cursor-pointer hover:border-primary/40 transition-colors"
    >
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-linear-to-br from-[#FFF2F0] to-[#FFD9CC]">
        <ImageWithFallback
          src={logo}
          alt={name}
          fill
          sizes="160px"
          className="object-cover"
          fallback={
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-primary font-bold text-lg">
                {getInitials(name)}
              </span>
            </div>
          }
        />
      </div>

      <div className="mt-2 px-0.5">
        <p className="font-semibold text-xs text-foreground leading-snug truncate">
          {name}
        </p>
        {city && (
          <p className="text-[11px] text-secondary truncate mt-0.5">{city}</p>
        )}
        {rating !== undefined && (
          <div className="flex items-center gap-1 mt-1 text-[11px]">
            <StarIcon className="size-3 text-[#FFA18D]" />
            <span className="font-medium text-[#FFA18D]">
              {formatRating(rating)}
            </span>
          </div>
        )}
      </div>

      {!isDoctor && (
        <Button
          variant="outline"
          size="xs"
          className="w-full justify-center mt-2 h-7 text-[11px] px-2"
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
