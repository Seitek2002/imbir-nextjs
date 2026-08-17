"use client";

import { FC, ReactNode, useEffect, useRef } from "react";

import { useSpecializationOptions } from "@/entities/specialization";

import { RemoveIcon } from "@/shared/assets/icons";
import { replaceUrlState, useUrlSearchParams } from "@/shared/lib/url-state";
import { useCityStore } from "@/shared/store";
import { Button, Dropdown, RangeSlider } from "@/shared/ui";

type Props = {
  title?: string;
  prefix: string;
  fields?: {
    specialty?: boolean;
    experience?: boolean;
    rating?: boolean;
    price?: boolean;
  };
  children?: ReactNode;
};

const RATING_OPTIONS = [
  { value: "all", label: "Все" },
  { value: "5.0", label: "5.0" },
  { value: "4.0", label: "4.0" },
  { value: "3.0", label: "3.0" },
];

const MAX_EXP = 50;
const MAX_PRICE = 5000;
const RANGE_COMMIT_DELAY = 250;

export const FilterBar: FC<Props> = ({
  title = "Фильтры",
  prefix,
  fields = {
    specialty: true,
    experience: true,
    rating: true,
    price: true,
  },
  children,
}) => {
  const searchParams = useUrlSearchParams();

  // Общий хук на весь app — справочник почти не меняется, кешируется под
  // одним ключом (FilterBar/MobileFiltersModal/формы регистрации).
  const { options: specialtyOptions } = useSpecializationOptions(
    !!fields.specialty,
  );

  // Все значения — единственный источник правды: URL.
  // URL и локальный интерфейс обновляются без серверной навигации.
  const specialty =
    searchParams.get(`${prefix}_spec`)?.split(",").filter(Boolean) ?? [];
  const rating = searchParams.get(`${prefix}_rating`) ?? "all";

  const expParts = searchParams.get(`${prefix}_exp`)?.split("-").map(Number);
  const experienceMin = expParts?.[0] ?? 0;
  const experienceMax = expParts?.[1] ?? MAX_EXP;
  const experience: [number, number] = [experienceMin, experienceMax];

  const priceParts = searchParams
    .get(`${prefix}_price`)
    ?.split("-")
    .map(Number);
  const priceMin = priceParts?.[0] ?? 0;
  const priceMax = priceParts?.[1] ?? MAX_PRICE;
  const price: [number, number] = [priceMin, priceMax];

  const experienceDraftRef = useRef(experience);
  const priceDraftRef = useRef(price);
  const experienceCommitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const priceCommitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  useEffect(() => {
    experienceDraftRef.current = [experienceMin, experienceMax];
  }, [experienceMin, experienceMax]);
  useEffect(() => {
    priceDraftRef.current = [priceMin, priceMax];
  }, [priceMin, priceMax]);
  useEffect(
    () => () => {
      if (experienceCommitTimerRef.current)
        clearTimeout(experienceCommitTimerRef.current);
      if (priceCommitTimerRef.current)
        clearTimeout(priceCommitTimerRef.current);
    },
    [],
  );

  const updateURL = (key: string, value: string | null) => {
    const params = new URLSearchParams(window.location.search);
    if (value) {
      params.set(`${prefix}_${key}`, value);
    } else {
      params.delete(`${prefix}_${key}`);
    }
    replaceUrlState(params);
  };

  const handleSpecialtyChange = (val: string[]) => {
    updateURL("spec", val.length > 0 ? val.join(",") : null);
  };

  const handleRatingChange = (val: string) => {
    updateURL("rating", val === "all" ? null : val);
  };

  const handleExpChange = (val: [number, number]) => {
    experienceDraftRef.current = val;
    if (experienceCommitTimerRef.current)
      clearTimeout(experienceCommitTimerRef.current);
    experienceCommitTimerRef.current = setTimeout(
      () => updateURL("exp", `${val[0]}-${val[1]}`),
      RANGE_COMMIT_DELAY,
    );
  };

  const handlePriceChange = (val: [number, number]) => {
    priceDraftRef.current = val;
    if (priceCommitTimerRef.current) clearTimeout(priceCommitTimerRef.current);
    priceCommitTimerRef.current = setTimeout(
      () => updateURL("price", `${val[0]}-${val[1]}`),
      RANGE_COMMIT_DELAY,
    );
  };

  const commitExperience = (val?: [number, number]) => {
    if (experienceCommitTimerRef.current) {
      clearTimeout(experienceCommitTimerRef.current);
      experienceCommitTimerRef.current = null;
    }
    const next = val ?? experienceDraftRef.current;
    updateURL("exp", `${next[0]}-${next[1]}`);
  };

  const commitPrice = (val?: [number, number]) => {
    if (priceCommitTimerRef.current) {
      clearTimeout(priceCommitTimerRef.current);
      priceCommitTimerRef.current = null;
    }
    const next = val ?? priceDraftRef.current;
    updateURL("price", `${next[0]}-${next[1]}`);
  };

  const handleReset = () => {
    if (experienceCommitTimerRef.current)
      clearTimeout(experienceCommitTimerRef.current);
    if (priceCommitTimerRef.current) clearTimeout(priceCommitTimerRef.current);
    experienceCommitTimerRef.current = null;
    priceCommitTimerRef.current = null;

    const params = new URLSearchParams(searchParams.toString());
    params.delete(`${prefix}_spec`);
    params.delete(`${prefix}_exp`);
    params.delete(`${prefix}_rating`);
    params.delete(`${prefix}_price`);
    replaceUrlState(params);
  };

  const city = useCityStore((s) => s.city);

  return (
    <>
      <div className="w-full">
        {children ? (
          children
        ) : (
          <>
            <div className="max-w-200 flex items-center gap-3">
              <h2 className="text-[40px] font-semibold">{title}</h2>
              {city && (
                <span className="text-sm font-medium text-primary bg-[#FFF0EE] px-3 py-1 rounded-full border border-primary/20 shrink-0">
                  в г. {city}
                </span>
              )}
            </div>
            <p className="text-secondary text-lg mt-4 mb-6">
              Поиск в г.{" "}
              <span className="font-medium text-foreground">{city}</span>.
              Выберите интересующие вас параметры, чтобы ознакомиться с
              подходящими вариантами
            </p>
          </>
        )}

        <div className="grid grid-cols-4 gap-5 items-start">
          {fields.specialty && (
            <Dropdown
              label="Специализация"
              placeholder="Все"
              options={specialtyOptions}
              value={specialty}
              onChange={(val) => handleSpecialtyChange(val as string[])}
              isMulti={true}
              type="checkbox"
              searchable
            />
          )}
          {fields.experience && (
            <RangeSlider
              id={`exp-desktop-${prefix}`}
              label="Стаж, лет"
              min={0}
              max={MAX_EXP}
              step={1}
              value={experience}
              onChange={handleExpChange}
              onChangeEnd={commitExperience}
              className="bg-white"
            />
          )}
          {fields.rating && (
            <Dropdown
              label="Оценка"
              placeholder="Все"
              type="radio"
              options={RATING_OPTIONS}
              value={rating || "all"}
              onChange={(val) => handleRatingChange(val as string)}
            />
          )}
          {fields.price && (
            <RangeSlider
              id={`price-desktop-${prefix}`}
              label="Стоимость, с"
              min={0}
              max={MAX_PRICE}
              step={50}
              value={price}
              onChange={handlePriceChange}
              onChangeEnd={commitPrice}
              className="bg-white"
            />
          )}
        </div>

        <div className="flex justify-end mt-6">
          <Button
            IconLeft={RemoveIcon}
            variant="text"
            size="sm"
            onClick={handleReset}
          >
            Сбросить фильтры
          </Button>
        </div>
      </div>
    </>
  );
};
