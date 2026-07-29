"use client";

import { FC } from "react";

import Link from "next/link";

import { hasPrice } from "@/shared/lib/price";
import { useAuthStore } from "@/shared/store";
import { Button } from "@/shared/ui";

type Props = {
  name: string;
  category: string;
  price?: string | number | null;
  clinicName?: string;
  href: string;
  onBook?: () => void;
};

// Уменьшенная версия ServiceCard — для мест, где нужен узнаваемый вид
// карточки услуги, но в компактной обвязке (напр. рекомендации ИИ-чата).
// Рекомендация услуги не несёт фото — акцент на название/категорию/цену,
// как ценник, а не как фотокарточка.
export const ServiceCompactCard: FC<Props> = ({
  name,
  category,
  price,
  clinicName,
  href,
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
      href={href}
      className="w-40 shrink-0 bg-white rounded-2xl border border-border-soft p-3 flex flex-col cursor-pointer hover:border-primary/40 transition-colors"
    >
      <p className="text-[10px] text-muted uppercase tracking-wider truncate">
        {category}
      </p>
      <p className="font-semibold text-xs text-foreground leading-snug mt-1 line-clamp-2 min-h-8">
        {name}
      </p>
      {clinicName && (
        <p className="text-[11px] text-secondary truncate mt-1">{clinicName}</p>
      )}
      {/* Без цены строку не рисуем — «0 с» читалось бы как «бесплатно» */}
      {hasPrice(price) && (
        <p className="font-bold text-sm text-foreground mt-2">{price} с</p>
      )}

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
