"use client";

import { FC, useRef, useState } from "react";

import Link from "next/link";

import { ClinicCard } from "@/entities/clinic";

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  GeoBtnArrowIcon,
  GeoIcon,
  RemoveIcon,
} from "@/shared/assets/icons";
import { Dropdown } from "@/shared/ui";

type Clinic = {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  experience: number;
  address: string;
  image?: string;
  specialty: string;
};

type Props = {
  title?: string;
  description?: string;
  city?: string;
  district?: string;
  clinics: Clinic[];
  viewAllHref?: string;
};

const SPECIALTY_OPTIONS = [
  { value: "all", label: "Все" },
  { value: "cardiology", label: "Кардиология" },
  { value: "dentistry", label: "Стоматология" },
  { value: "neurology", label: "Неврология" },
  { value: "ophthalmology", label: "Офтальмология" },
];

const RATING_OPTIONS = [
  { value: "all", label: "Все" },
  { value: "5", label: "5.0" },
  { value: "4", label: "от 4.0" },
  { value: "3", label: "от 3.0" },
];

export const ClinicsSwiper: FC<Props> = ({
  title = "Клиники",
  description,
  city = "г. Бишкек",
  district = "Ленинский район",
  clinics,
  viewAllHref,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [specialty, setSpecialty] = useState("all");
  const [rating, setRating] = useState("all");

  const hasActiveFilters = specialty !== "all" || rating !== "all";

  const filtered = clinics.filter((c) => {
    const matchSpecialty = specialty === "all" || c.specialty === specialty;
    const matchRating = rating === "all" || c.rating >= parseFloat(rating);
    return matchSpecialty && matchRating;
  });

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -300 : 300,
      behavior: "smooth",
    });
  };

  return (
    <section className="py-6 flex flex-col gap-4 bg-white">
      {/* Заголовок + фильтры — только десктоп */}
      <div className="hidden md:flex flex-col gap-4 px-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="font-semibold text-xl text-foreground">{title}</h2>
              <button className="flex items-center gap-1.5 border border-border rounded-full px-3 py-1.5 text-sm">
                <GeoIcon className="size-4" />
                <span className="flex flex-col items-start leading-tight">
                  <span className="text-xs font-semibold text-foreground">
                    {city}
                  </span>
                  <span className="text-[10px] text-secondary">{district}</span>
                </span>
                <GeoBtnArrowIcon className="size-3.5" />
              </button>
            </div>
            {viewAllHref && (
              <Link
                href={viewAllHref}
                className="text-sm text-primary shrink-0 hover:opacity-70 transition-opacity"
              >
                Все
              </Link>
            )}
          </div>
          {description && (
            <p className="text-sm text-secondary">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Dropdown
            options={SPECIALTY_OPTIONS}
            value={specialty}
            onChange={(v) => setSpecialty(v as string)}
            placeholder="Специализация"
            className="w-44"
          />
          <Dropdown
            options={RATING_OPTIONS}
            value={rating}
            onChange={(v) => setRating(v as string)}
            placeholder="Оценка"
            className="w-36"
          />
          {hasActiveFilters && (
            <button
              onClick={() => {
                setSpecialty("all");
                setRating("all");
              }}
              className="flex items-center gap-1.5 text-sm text-primary cursor-pointer transition-opacity hover:opacity-70"
            >
              <RemoveIcon className="size-4" />
              Сбросить фильтры
            </button>
          )}
        </div>
      </div>

      {/* Заголовок мобиль — только title + Все */}
      <div className="md:hidden px-4 flex items-center justify-between">
        <h2 className="font-semibold text-xl text-foreground">{title}</h2>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-sm text-primary hover:opacity-70 transition-opacity"
          >
            Все
          </Link>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-secondary px-4 py-4">
          Ничего не найдено по выбранным фильтрам
        </p>
      ) : (
        <>
          {/* Мобиль: вертикальный список, карточки на всю ширину */}
          <div className="md:hidden flex flex-col gap-3 px-4">
            {filtered.map((clinic) => (
              <ClinicCard
                key={clinic.id}
                name={clinic.name}
                rating={clinic.rating}
                reviews={clinic.reviews}
                experience={clinic.experience}
                address={clinic.address}
                image={clinic.image}
              />
            ))}
          </div>

          {/* Десктоп: горизонтальный скролл */}
          <div className="hidden md:block relative">
            <button
              onClick={() => scroll("left")}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 cursor-pointer"
              aria-label="Назад"
            >
              <ArrowLeftIcon className="size-10" />
            </button>

            <div
              ref={scrollRef}
              className="flex gap-3 overflow-x-auto scroll-smooth px-4 pb-1"
              style={{ scrollbarWidth: "none" }}
            >
              {filtered.map((clinic) => (
                <div key={clinic.id} className="w-81.25 h-89 shrink-0">
                  <ClinicCard
                    name={clinic.name}
                    rating={clinic.rating}
                    reviews={clinic.reviews}
                    experience={clinic.experience}
                    address={clinic.address}
                    image={clinic.image}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={() => scroll("right")}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 cursor-pointer"
              aria-label="Вперёд"
            >
              <ArrowRightIcon className="size-10" />
            </button>
          </div>
        </>
      )}
    </section>
  );
};
