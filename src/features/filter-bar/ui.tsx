"use client";

import { FC, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { Button, Dropdown, IconBtn, RangeSlider } from "@/shared";

import { GeoIcon, RemoveIcon } from "@/shared/assets";

type Props = {
  fields?: {
    specialty?: boolean;
    experience?: boolean;
    rating?: boolean;
    price?: boolean;
  };
};

// УБРАЛИ { value: "all", label: "Все" }, так как isMulti сам рендерит "Все"
const SPECIALTY_OPTIONS = [
  { value: "cardiologist", label: "Кардиолог" },
  { value: "therapist", label: "Терапевт" },
  { value: "surgeon", label: "Хирург" },
  { value: "dentist", label: "Стоматолог" },
];

const RATING_OPTIONS = [
  { value: "all", label: "Все" },
  { value: "5.0", label: "5.0" },
  { value: "4.0", label: "4.0" },
  { value: "3.0", label: "3.0" },
  { value: "2.0", label: "2.0" },
  { value: "1.0", label: "1.0" },
];

const MAX_EXP = 50;
const MAX_PRICE = 5000;

export const FilterBar: FC<Props> = ({
  fields = { specialty: true, experience: true, rating: true, price: true },
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 1. ИЗМЕНИЛИ СТЕЙТ СПЕЦИАЛИЗАЦИИ НА МАССИВ
  const initialSpec = searchParams.get("spec");
  const [specialty, setSpecialty] = useState<string[]>(
    initialSpec ? initialSpec.split(",") : [], // Если пусто, то пустой массив (значит выбрано "Все")
  );

  const initialExp = searchParams.get("exp")?.split("-").map(Number);
  const [experience, setExperience] = useState<[number, number]>([
    initialExp?.[0] ?? 0,
    initialExp?.[1] ?? 10,
  ]);

  const [rating, setRating] = useState<string | null>(
    searchParams.get("rating") || "all",
  );

  const initialPrice = searchParams.get("price")?.split("-").map(Number);
  const [price, setPrice] = useState<[number, number]>([
    initialPrice?.[0] ?? 0,
    initialPrice?.[1] ?? 1000,
  ]);

  const handleReset = () => {
    setSpecialty([]); // Сброс мультивыбора — это пустой массив
    setExperience([0, 10]);
    setRating("all");
    setPrice([0, 1000]);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("spec");
    params.delete("exp");
    params.delete("rating");
    params.delete("price");
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="w-full">
      <div className="max-w-200 flex items-center">
        <h2 className="border-r border-r-[#E5E6E8] text-[40px] font-semibold pr-6">
          Специалисты
        </h2>
        <div className="flex items-center gap-2 ml-4">
          <IconBtn size="md">
            <GeoIcon className="size-5 [&_path]:stroke-white" />
          </IconBtn>
          <div>
            <div className="text-[#191A1B] font-medium">г. Бишкек</div>
            <div className="text-[#838A8D] text-sm">Ленинский район</div>
          </div>
        </div>
      </div>

      <p className="text-[#686F72] text-lg mt-4 mb-10">
        Выберите интересующие вас параметры, чтобы ознакомиться с подходящими
        врачами
      </p>

      <div className="grid grid-cols-4 gap-5 items-start">
        {fields.specialty && (
          <Dropdown
            label="Специализация"
            placeholder="Все" // Будет показываться, когда массив пустой
            options={SPECIALTY_OPTIONS}
            value={specialty}
            onChange={(val) => setSpecialty(val as string[])}
            isMulti={true} // 2. ВКЛЮЧАЕМ МУЛЬТИ-ВЫБОР
            type="checkbox" // 3. ВКЛЮЧАЕМ ЧЕКБОКСЫ
          />
        )}

        {fields.experience && (
          <RangeSlider
            id="exp-desktop"
            label="Стаж, лет"
            min={0}
            max={MAX_EXP}
            step={1}
            value={experience}
            onChange={setExperience}
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
            onChange={(val) => setRating(val as string)}
          />
        )}

        {fields.price && (
          <RangeSlider
            id="price-desktop"
            label="Стоимость, с"
            min={0}
            max={MAX_PRICE}
            step={50}
            value={price}
            onChange={setPrice}
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
  );
};
