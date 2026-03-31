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
  { value: "all", label: "Все" },
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

  // Специализация (пока храним строку, позже подключим к шторке)
  const [specialty, setSpecialty] = useState<string | null>(
    searchParams.get("spec"),
  );

  // ЛОГИКА ПРИМЕНЕНИЯ И СБРОСА ---

  const handleApply = () => {
    // Берем текущие параметры (например, если там есть ?search=...), чтобы не затереть их
    const params = new URLSearchParams(searchParams.toString());

    // Удаляем флаг открытия модалки, чтобы она закрылась при пуше
    params.delete("modal");

    // Стаж
    if (fields?.experience)
      params.set("exp", `${experience[0]}-${experience[1]}`);

    // Стоимость
    if (fields?.price) params.set("price", `${price[0]}-${price[1]}`);

    // Оценка
    if (fields?.rating && rating) params.set("rating", rating);
    else params.delete("rating");

    // Специализация
    if (fields?.specialty && specialty) params.set("spec", specialty);
    else params.delete("spec");

    // Пушим новые параметры и закрываем (если onClose просто делает back(), то push достаточно,
    // но если onClose меняет стейт родителя, вызываем его).
    // Важно: мы используем replace, чтобы не плодить 100 переходов в истории для одной страницы.
    router.replace(`?${params.toString()}`);
    // Если onClose делает router.back(), здесь его вызывать НЕ НАДО, иначе нас откинет назад.
    // Я оставлю его закомментированным на случай, если у тебя там другая логика.
    // onClose();
  };

  const handleReset = () => {
    setExperience([0, 10]);
    setPrice([0, MAX_PRICE]);
    setRating(null);
    setSpecialty(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#F2F3F5] flex flex-col">
      <Header title="Фильтр" />

      <div className="flex-1 overflow-y-auto mt-2 px-2 pb-4 space-y-3">
        {/* БЛОК 1: СПЕЦИАЛИЗАЦИЯ */}
        {fields?.specialty && (
          <div className="bg-white p-4 rounded-2xl">
            <span className="block text-sm font-medium text-[#191A1B] mb-2">
              Специализация
            </span>
            <Dropdown
              options={SPECIALTY_OPTIONS}
              value={specialty || "all"} // "all" как дефолтное значение
              onChange={(value) => setSpecialty(value === "all" ? null : value)}
              placeholder="Выберите специализацию"
              className="w-full" // Убедись, что дропдаун тянется на всю ширину
            />
          </div>
        )}

        {/* БЛОК 2: СТАЖ */}
        {fields?.experience && (
          <div className="bg-white p-4 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-[#191A1B]">
                Стаж, лет
              </span>
              <div className="text-sm text-[#F5653E]">
                {experience[0]} -{" "}
                {experience[1] === MAX_EXP ? `${MAX_EXP}+` : experience[1]}
              </div>
            </div>
            <RangeSlider
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
                  // Убираем justify-between, так как теперь Radio сам содержит кружочек и мы его выровняем через флекс
                  className="flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <StarIcon className="size-5 text-[#F5653E]" />
                    <span className="text-base text-[#191A1B]">{rate}</span>
                  </div>

                  {/* Используем твой компонент Radio */}
                  <Radio
                    name="rating"
                    value={rate}
                    checked={rating === rate}
                    onChange={(e) => setRating(e.target.value)}
                    size="large" // У нас там размер 5 (20px), твой large как раз size-5
                    // Твой компонент имеет отступы (gap-2.5) для label,
                    // но так как мы вынесли label (звезду и текст) отдельно для гибкости макета,
                    // мы просто не передаем пропс label внутрь Radio.
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {/* БЛОК 4: СТОИМОСТЬ */}
        {fields?.price && (
          <div className="bg-white p-4 rounded-2xl">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm font-medium text-[#191A1B]">
                Стоимость, с
              </span>
              <div className="text-sm text-[#F5653E]">
                {price[0]} -{" "}
                {price[1] === MAX_PRICE ? `${MAX_PRICE}+` : price[1]}
              </div>
            </div>
            <RangeSlider
              min={0}
              max={MAX_PRICE}
              step={50}
              value={price}
              onChange={setPrice}
            />
          </div>
        )}
      </div>

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
