"use client";

import { FC, ReactNode, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { Button, Dropdown, RangeSlider } from "@/shared";

import { RemoveIcon } from "@/shared/assets";

type Props = {
  title?: string;
  prefix: string;
  fields?: {
    specialty?: boolean;
    experience?: boolean;
    rating?: boolean;
    price?: boolean;
    online?: boolean; // <-- Добавили поддержку онлайн-фильтра
  };
  children?: ReactNode;
};

const SPECIALTY_OPTIONS = [
  { value: "Кардиолог", label: "Кардиолог" },
  { value: "Врач-терапевт", label: "Терапевт" },
  { value: "Хирург", label: "Хирург" },
  { value: "Педиатр", label: "Педиатр" },
];

const RATING_OPTIONS = [
  { value: "all", label: "Все" },
  { value: "5.0", label: "5.0" },
  { value: "4.0", label: "4.0" },
  { value: "3.0", label: "3.0" },
];

const MAX_EXP = 50;
const MAX_PRICE = 5000;

export const FilterBar: FC<Props> = ({
  title = "Фильтры",
  prefix,
  fields = {
    specialty: true,
    experience: true,
    rating: true,
    price: true,
    online: true,
  },
  children,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialSpec = searchParams.get(`${prefix}_spec`);
  const [specialty, setSpecialty] = useState<string[]>(
    initialSpec ? initialSpec.split(",") : [],
  );

  const initialExp = searchParams.get(`${prefix}_exp`)?.split("-").map(Number);
  const [experience, setExperience] = useState<[number, number]>([
    initialExp?.[0] ?? 0,
    initialExp?.[1] ?? MAX_EXP,
  ]);

  const [rating, setRating] = useState<string | null>(
    searchParams.get(`${prefix}_rating`) || "all",
  );

  const initialPrice = searchParams
    .get(`${prefix}_price`)
    ?.split("-")
    .map(Number);
  const [price, setPrice] = useState<[number, number]>([
    initialPrice?.[0] ?? 0,
    initialPrice?.[1] ?? MAX_PRICE,
  ]);

  // Стейт для онлайн-фильтра
  const initialOnline = searchParams.get(`${prefix}_online`) === "true";
  const [isOnline, setIsOnline] = useState<boolean>(initialOnline);

  const updateURL = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(`${prefix}_${key}`, value);
    } else {
      params.delete(`${prefix}_${key}`);
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleSpecialtyChange = (val: string[]) => {
    setSpecialty(val);
    updateURL("spec", val.length > 0 ? val.join(",") : null);
  };

  const handleRatingChange = (val: string) => {
    setRating(val);
    updateURL("rating", val === "all" ? null : val);
  };

  const handleExpChange = (val: [number, number]) => {
    setExperience(val);
    updateURL("exp", `${val[0]}-${val[1]}`);
  };

  const handlePriceChange = (val: [number, number]) => {
    setPrice(val);
    updateURL("price", `${val[0]}-${val[1]}`);
  };

  const handleOnlineChange = (checked: boolean) => {
    setIsOnline(checked);
    updateURL("online", checked ? "true" : null);
  };

  const handleReset = () => {
    setSpecialty([]);
    setExperience([0, MAX_EXP]);
    setRating("all");
    setPrice([0, MAX_PRICE]);
    setIsOnline(false);

    const params = new URLSearchParams(searchParams.toString());
    params.delete(`${prefix}_spec`);
    params.delete(`${prefix}_exp`);
    params.delete(`${prefix}_rating`);
    params.delete(`${prefix}_price`);
    params.delete(`${prefix}_online`);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      <div className="w-full">
        {children ? (
          children
        ) : (
          <>
            <div className="max-w-200 flex items-center">
              <h2 className="text-[40px] font-semibold pr-6">{title}</h2>
            </div>
            <p className="text-[#686F72] text-lg mt-4 mb-6">
              Выберите интересующие вас параметры, чтобы ознакомиться с
              подходящими вариантами
            </p>
          </>
        )}

        {/* Чекбокс ОНЛАЙН */}
        {fields.online && (
          <div className="mb-6 flex items-center">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={isOnline}
                  onChange={(e) => handleOnlineChange(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="w-6 h-6 border-2 border-[#E3E4E5] rounded-md peer-checked:bg-[#F5653E] peer-checked:border-[#F5653E] transition-colors"></div>
                <svg
                  className="absolute w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span className="text-[#191A1B] font-medium group-hover:text-[#F5653E] transition-colors">
                Только онлайн-консультация
              </span>
            </label>
          </div>
        )}

        <div className="grid grid-cols-4 gap-5 items-start">
          {fields.specialty && (
            <Dropdown
              label="Специализация"
              placeholder="Все"
              options={SPECIALTY_OPTIONS}
              value={specialty}
              onChange={(val) => handleSpecialtyChange(val as string[])}
              isMulti={true}
              type="checkbox"
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
