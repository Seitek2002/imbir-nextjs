"use client";

import { FC } from "react";

import Link from "next/link";

import { StarIcon, UserCircleIcon } from "@/shared/assets/icons";
import { ROUTES } from "@/shared/config";
import { useAuthStore } from "@/shared/store";
import { Button, ImageWithFallback } from "@/shared/ui";

type Props = {
  id: string | number;
  name: string;
  specialty: string;
  photo?: string | null;
  rating?: string | number;
  onBook?: () => void;
};

// Уменьшенная версия DoctorCard — для мест, где нужен узнаваемый вид
// карточки врача, но в компактной обвязке (напр. рекомендации ИИ-чата).
export const DoctorCompactCard: FC<Props> = ({
  id,
  name,
  specialty,
  photo,
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
      href={ROUTES.SPECIALIST_DETAILS(id)}
      className="w-40 shrink-0 bg-white rounded-2xl border border-border-soft p-2 flex flex-col cursor-pointer hover:border-primary/40 transition-colors"
    >
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-primary-tint">
        <ImageWithFallback
          src={photo}
          alt={name}
          fill
          sizes="160px"
          className="object-cover object-top"
          fallback={
            <div className="w-full h-full flex items-center justify-center">
              <UserCircleIcon className="size-8 text-dim" />
            </div>
          }
        />
      </div>

      <div className="mt-2 px-0.5">
        <p className="font-semibold text-xs text-foreground leading-snug truncate">
          {name}
        </p>
        <p className="text-[11px] text-secondary truncate mt-0.5">
          {specialty}
        </p>
        {rating !== undefined && (
          <div className="flex items-center gap-1 mt-1 text-[11px]">
            <StarIcon className="size-3 text-[#FF7C63]" />
            <span className="font-medium text-[#FF7C63]">{rating}</span>
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
