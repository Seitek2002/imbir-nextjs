"use client";

import { FC, useState } from "react";

import Image, { StaticImageData } from "next/image";
import Link from "next/link";

import { HeartIcon, HeartIcon2, StarIcon } from "@/shared/assets/icons";
import { ROUTES } from "@/shared/config";
import { useAuthStore } from "@/shared/store";
import { Button } from "@/shared/ui";

type Props = {
  id?: string;
  name: string;
  category: string;
  clinic?: string;
  clinicId?: string;
  rating: number;
  reviews: number;
  price: number | string;
  image?: string | StaticImageData;
  onBook?: () => void;
  onSave?: () => void;
  initialSaved?: boolean;
  variant?: "vertical" | "horizontal";
};

const SaveButton: FC<{
  initialSaved: boolean;
  onSave?: () => void;
}> = ({ initialSaved, onSave }) => {
  const [isSaved, setIsSaved] = useState(initialSaved);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSaved(!isSaved);
    onSave?.();
  };

  return (
    <button
      onClick={handleClick}
      className="w-12 h-12 rounded-full bg-white flex items-center justify-center hover:bg-surface transition-colors shadow-sm shrink-0"
      aria-label={isSaved ? "Удалить из избранного" : "Добавить в избранное"}
    >
      {isSaved ? (
        <HeartIcon2 className="w-6 h-6 text-primary" />
      ) : (
        <HeartIcon className="w-6 h-6 text-primary" />
      )}
    </button>
  );
};

export const ServiceCard: FC<Props> = ({
  id,
  name,
  category,
  clinic,
  clinicId,
  rating,
  reviews,
  price,
  image,
  onBook,
  onSave,
  initialSaved = false,
  variant = "vertical",
}) => {
  const displayClinic = clinic || clinicId || "Клиника не указана";
  const user = useAuthStore((s) => s.user);
  const isDoctor = user?.role === "doctor";
  const href = id ? `${ROUTES.RECORD}?service=${id}` : ROUTES.RECORD;
  const stopProp = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  if (variant === "horizontal") {
    return (
      <Link
        href={href}
        className="bg-white rounded-3xl p-4 flex items-center gap-4 border border-border cursor-pointer hover:border-primary/40 transition-colors"
      >
        <div className="relative w-28 h-28 rounded-2xl overflow-hidden bg-[#FFF2F0] flex items-center justify-center shrink-0">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              sizes="112px"
              className="object-cover"
            />
          ) : (
            <span className="text-primary text-2xl font-bold uppercase">
              {name.slice(0, 2)}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0 flex flex-col self-stretch">
          <h3 className="text-foreground font-semibold text-base leading-snug line-clamp-2 mb-1">
            {name}
          </h3>

          <p className="text-muted text-xs mb-1">
            {category} <span className="text-primary">• {displayClinic}</span>
          </p>

          <div className="flex items-center gap-1 mb-2 text-xs">
            <StarIcon className="w-3.5 h-3.5 text-primary" />
            <span className="text-primary font-medium">{rating}</span>
            <span className="text-secondary">({reviews})</span>
          </div>

          <div className="mt-auto flex items-center justify-between gap-3">
            <span className="text-foreground font-bold text-base whitespace-nowrap">
              {price} с
            </span>
            <div className="flex items-center gap-2">
              {!isDoctor && (
                <Button
                  variant="outline"
                  size="xs"
                  className="px-4 py-1.5 justify-center text-xs"
                  onClick={(e) => {
                    stopProp(e);
                    onBook?.();
                  }}
                >
                  Записаться
                </Button>
              )}
              <SaveButton initialSaved={initialSaved} onSave={onSave} />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="bg-white rounded-3xl border border-border overflow-hidden flex flex-col h-full cursor-pointer hover:border-primary/40 transition-colors"
    >
      <div className="relative aspect-4/3 w-full">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-[#FFF2F0] flex items-center justify-center">
            <span className="text-primary text-3xl font-bold uppercase">
              {name.slice(0, 2)}
            </span>
          </div>
        )}
        <div className="absolute top-4 right-4 z-10">
          <SaveButton initialSaved={initialSaved} onSave={onSave} />
        </div>
      </div>

      <div className="flex-1 p-4 flex flex-col">
        <p className="text-muted text-xs mb-1 uppercase tracking-wider">
          {category}
        </p>

        <h3 className="text-foreground font-semibold text-base leading-snug mb-1 line-clamp-2">
          {name}
        </h3>

        <p className="text-secondary text-xs mb-3 truncate">{displayClinic}</p>

        <div className="flex items-center gap-1 mb-4 text-sm">
          <StarIcon className="w-3.5 h-3.5 text-primary" />
          <span className="text-primary font-medium">{rating}</span>
          <span className="text-secondary">({reviews})</span>
        </div>

        <div className="mt-auto pt-3 flex items-center justify-between gap-3 border-t border-border-soft">
          <span className="text-foreground font-bold text-lg whitespace-nowrap">
            {price} с
          </span>
          {!isDoctor && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 justify-center"
              onClick={(e) => {
                stopProp(e);
                onBook?.();
              }}
            >
              Записаться
            </Button>
          )}
        </div>
      </div>
    </Link>
  );
};
