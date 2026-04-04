"use client";

import { FC, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { Button, Dropdown, Radio, RangeSlider } from "@/shared";
import { Header } from "@/widgets";

import { StarIcon } from "@/shared/assets";

type Props = {
  isOpen: boolean;
  fields?: {
    specialty?: boolean;
    experience?: boolean;
    rating?: boolean;
    price?: boolean;
  };
};

const SPECIALTY_OPTIONS = [
  { value: "cardiologist", label: "Кардиолог" },
  { value: "therapist", label: "Терапевт" },
  { value: "surgeon", label: "Хирург" },
  { value: "dentist", label: "Стоматолог" },
];
const RATINGS = ["5.0", "4.0", "3.0", "2.0", "1.0"];
const MAX_PRICE = 5000;
const MAX_EXP = 50;

export const MobileFiltersModal: FC<Props> = ({ isOpen, fields }) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Стаж
  const initialExp = searchParams.get("exp")?.split("-").map(Number);
  const [experience, setExperience] = useState<[number, number]>([
    initialExp?.[0] ?? 0,
    initialExp?.[1] ?? 10,
  ]);

  // Стоимость
  const initialPrice = searchParams.get("price")?.split("-").map(Number);
  const [price, setPrice] = useState<[number, number]>([
    initialPrice?.[0] ?? 0,
    initialPrice?.[1] ?? 1000,
  ]);

  // Оценка
  const [rating, setRating] = useState<string | null>(
    searchParams.get("rating"),
  );

  // Специализация (ИСПРАВЛЕНО НА МАССИВ)
  const initialSpec = searchParams.get("spec");
  const [specialty, setSpecialty] = useState<string[]>(
    initialSpec ? initialSpec.split(",") : [],
  );

  // ЛОГИКА ПРИМЕНЕНИЯ И СБРОСА ---
  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());

    params.delete("modal");

    if (fields?.experience)
      params.set("exp", `${experience[0]}-${experience[1]}`);

    if (fields?.price) params.set("price", `${price[0]}-${price[1]}`);

    if (fields?.rating && rating) params.set("rating", rating);
    else params.delete("rating");

    // ИСПРАВЛЕНО: Сохраняем массив как строку через запятую
    if (fields?.specialty && specialty.length > 0) {
      params.set("spec", specialty.join(","));
    } else {
      params.delete("spec");
    }

    router.replace(`?${params.toString()}`);
  };

  const handleReset = () => {
    setExperience([0, 10]);
    setPrice([0, MAX_PRICE]);
    setRating(null);
    setSpecialty([]); // ИСПРАВЛЕНО: Сбрасываем в пустой массив
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#F2F3F5] flex flex-col">
      <Header title="Фильтр" />

      <div className="flex-1 overflow-y-auto mt-2 px-2 pb-10 space-y-3">
        {/* БЛОК 1: СПЕЦИАЛИЗАЦИЯ */}
        {fields?.specialty && (
          <div className="bg-white p-4 rounded-2xl">
            <span className="block text-sm font-medium text-[#191A1B] mb-2">
              Специализация
            </span>
            <Dropdown
              options={SPECIALTY_OPTIONS}
              value={specialty}
              onChange={(val) => setSpecialty(val as string[])}
              placeholder="Выберите специализацию"
              className="w-full"
              isMulti={true}
              type="checkbox"
            />
          </div>
        )}

        {/* БЛОК 2: СТАЖ */}
        {fields?.experience && (
          <div className="bg-white p-4 rounded-2xl">
            <RangeSlider
              label="Стаж, лет"
              id="exp"
              min={0}
              max={MAX_EXP}
              step={1}
              value={experience}
              onChange={setExperience}
            />
          </div>
        )}

        {/* БЛОК 3: ОЦЕНКА (РАДИО) */}
        {fields?.rating && (
          <div className="bg-white p-4 rounded-2xl">
            <span className="block text-sm font-medium text-[#191A1B] mb-3">
              Оценка
            </span>
            <div className="flex flex-col gap-4">
              {RATINGS.map((rate) => (
                <label
                  key={rate}
                  className="flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <StarIcon className="size-5 text-[#F5653E]" />
                    <span className="text-base text-[#191A1B]">{rate}</span>
                  </div>
                  <Radio
                    name="rating"
                    value={rate}
                    checked={rating === rate}
                    onChange={(e) => setRating(e.target.value)}
                    size="large"
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {/* БЛОК 4: СТОИМОСТЬ */}
        {fields?.price && (
          <div className="bg-white p-4 rounded-2xl">
            <RangeSlider
              label="Стоимость, с"
              id="price"
              min={0}
              max={MAX_PRICE}
              step={50}
              value={price}
              onChange={setPrice}
            />
          </div>
        )}
      </div>

      {/* ФУТЕР С КНОПКАМИ */}
      <div className="bg-white p-4 grid grid-cols-2 gap-3 pb-8 rounded-t-2xl shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
        <Button
          variant="outline"
          className="justify-center"
          size="sm"
          onClick={handleReset}
        >
          Сбросить
        </Button>
        <Button className="justify-center" size="sm" onClick={handleApply}>
          Применить
        </Button>
      </div>
    </div>
  );
};
