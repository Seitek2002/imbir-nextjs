"use client";

import Link from "next/link";

import {
  SPECIALIZATION_TILES_LIMIT,
  SpecializationIllustration,
  useSpecializationTiles,
} from "@/entities/specialization";

import { ROUTES } from "@/shared/config";

const CARD_CLASS =
  "flex flex-col items-center gap-3 md:gap-4 p-4 md:p-6 bg-white border border-border rounded-2xl md:rounded-3xl";

export const SpecializationsSection = () => {
  const { tiles, isLoading } = useSpecializationTiles();

  // Пока справочник не пришёл — держим сетку скелетонов той же геометрии,
  // чтобы блок не прыгал. Если бэк ничего не отдал, секцию не показываем.
  if (!isLoading && tiles.length === 0) return null;

  return (
    <section className="w-full max-w-360 mx-auto px-4 md:px-10 pt-8 pb-0 md:py-12">
      <div className="flex items-start justify-between mb-6 md:mb-8">
        <div>
          <h2 className="text-2xl md:text-[32px] font-bold text-foreground leading-tight">
            Специализации
          </h2>
          <p className="hidden md:block text-muted text-base mt-1">
            Весь спектр услуг на одной площадке
          </p>
        </div>
        <Link
          href={ROUTES.SPECIALISTS}
          className="md:hidden text-primary text-sm font-medium mt-1"
        >
          Все
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {isLoading
          ? Array.from({ length: SPECIALIZATION_TILES_LIMIT }).map((_, i) => (
              <div key={i} className={CARD_CLASS}>
                <div className="w-20 h-20 md:w-28 md:h-28 shrink-0 rounded-2xl skeleton" />
                <div className="h-5 w-24 skeleton rounded" />
              </div>
            ))
          : tiles.map(({ name, image, href }) => {
              return (
                <Link
                  key={name}
                  href={href}
                  className={`group ${CARD_CLASS} cursor-pointer hover:border-primary/40 hover:shadow-sm transition-all duration-200`}
                >
                  <div className="relative w-20 h-20 md:w-28 md:h-28 shrink-0">
                    <SpecializationIllustration
                      image={image}
                      name={name}
                      sizes="(min-width: 768px) 112px, 80px"
                      className="group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <span className="text-sm md:text-base font-medium text-foreground text-center leading-snug">
                    {name}
                  </span>
                </Link>
              );
            })}
      </div>
    </section>
  );
};
