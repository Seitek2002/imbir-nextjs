"use client";

import { FC, useState } from "react";

import { useSpecializationOptions } from "@/entities/specialization";

import { StarIcon } from "@/shared/assets/icons";
import { replaceUrlState, useUrlSearchParams } from "@/shared/lib/url-state";
import { Button, Dropdown, PageHeader, Radio, RangeSlider } from "@/shared/ui";

type DropdownOption = { label: string; value: string };

type Props = {
  categoryOptions?: DropdownOption[];
  clinicOptions?: DropdownOption[];
  fields?: {
    category?: boolean;
    clinic?: boolean;
    experience?: boolean;
    price?: boolean;
    rating?: boolean;
    specialty?: boolean;
  };
  isOpen: boolean;
  prefix: string;
};

const RATINGS = ["5.0", "4.0", "3.0", "2.0", "1.0"];
const MAX_PRICE = 5000;
const MAX_EXP = 50;

export const MobileFiltersModal: FC<Props> = ({
  isOpen,
  prefix,
  fields,
  categoryOptions = [],
  clinicOptions = [],
}) => {
  const searchParams = useUrlSearchParams();

  // Тот же общий хук, что и в десктопном FilterBar — один кеш на всё приложение.
  const { options: specialtyOptions } = useSpecializationOptions(
    !!fields?.specialty,
  );

  const initialExp = searchParams.get(`${prefix}_exp`)?.split("-").map(Number);
  const [experience, setExperience] = useState<[number, number]>([
    initialExp?.[0] ?? 0,
    initialExp?.[1] ?? MAX_EXP,
  ]);

  const initialPrice = searchParams
    .get(`${prefix}_price`)
    ?.split("-")
    .map(Number);
  const [price, setPrice] = useState<[number, number]>([
    initialPrice?.[0] ?? 0,
    initialPrice?.[1] ?? MAX_PRICE,
  ]);

  const [rating, setRating] = useState<null | string>(
    searchParams.get(`${prefix}_rating`),
  );

  const initialSpec = searchParams.get(`${prefix}_spec`);
  const [specialty, setSpecialty] = useState<string[]>(
    initialSpec ? initialSpec.split(",") : [],
  );

  const [category, setCategory] = useState<string>(
    fields?.category ? (searchParams.get(`${prefix}_spec`) ?? "") : "",
  );
  const [clinic, setClinic] = useState<string>(
    searchParams.get(`${prefix}_clinic`) ?? "",
  );

  const handleApply = () => {
    const params = new URLSearchParams(searchParams.toString());

    params.delete("modal");

    if (fields?.experience)
      params.set(`${prefix}_exp`, `${experience[0]}-${experience[1]}`);
    if (fields?.price) params.set(`${prefix}_price`, `${price[0]}-${price[1]}`);

    if (fields?.rating && rating && rating !== "all") {
      params.set(`${prefix}_rating`, rating);
    } else {
      params.delete(`${prefix}_rating`);
    }

    if (fields?.category) {
      if (category) params.set(`${prefix}_spec`, category);
      else params.delete(`${prefix}_spec`);
    } else if (fields?.specialty && specialty.length > 0) {
      params.set(`${prefix}_spec`, specialty.join(","));
    } else {
      params.delete(`${prefix}_spec`);
    }

    if (fields?.clinic) {
      if (clinic) params.set(`${prefix}_clinic`, clinic);
      else params.delete(`${prefix}_clinic`);
    }

    replaceUrlState(params);
  };

  const handleReset = () => {
    setExperience([0, MAX_EXP]);
    setPrice([0, MAX_PRICE]);
    setRating(null);
    setSpecialty([]);
    setCategory("");
    setClinic("");

    const params = new URLSearchParams(searchParams.toString());
    params.delete("modal");
    params.delete(`${prefix}_exp`);
    params.delete(`${prefix}_price`);
    params.delete(`${prefix}_rating`);
    params.delete(`${prefix}_spec`);
    params.delete(`${prefix}_clinic`);
    replaceUrlState(params);
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-background flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? "translate-y-0" : "translate-y-full"}`}
    >
      <PageHeader title="Фильтр" />

      <div className="flex-1 overflow-y-auto mt-2 px-2 pb-10 space-y-3">
        {/* БЛОК: УСЛУГА (категория) */}
        {fields?.category && (
          <div className="bg-white p-4 rounded-2xl">
            <span className="block text-sm font-medium text-foreground mb-2">
              Услуга
            </span>
            <Dropdown
              options={[{ value: "", label: "Все" }, ...categoryOptions]}
              value={category}
              onChange={(val) => setCategory(val as string)}
              placeholder="Все"
              className="w-full"
            />
          </div>
        )}

        {/* БЛОК: КЛИНИКА */}
        {fields?.clinic && (
          <div className="bg-white p-4 rounded-2xl">
            <span className="block text-sm font-medium text-foreground mb-2">
              Клиника
            </span>
            <Dropdown
              options={[{ value: "", label: "Все" }, ...clinicOptions]}
              value={clinic}
              onChange={(val) => setClinic(val as string)}
              placeholder="Все"
              className="w-full"
            />
          </div>
        )}

        {/* БЛОК 1: СПЕЦИАЛИЗАЦИЯ */}
        {fields?.specialty && (
          <div className="bg-white p-4 rounded-2xl">
            <span className="block text-sm font-medium text-foreground mb-2">
              Специализация
            </span>
            <Dropdown
              options={specialtyOptions}
              value={specialty}
              onChange={(val) => setSpecialty(val as string[])}
              placeholder="Выберите специализацию"
              className="w-full"
              isMulti={true}
              type="checkbox"
              searchable
            />
          </div>
        )}

        {/* БЛОК 2: СТАЖ */}
        {fields?.experience && (
          <div className="bg-white p-4 rounded-2xl">
            <RangeSlider
              label="Стаж, лет"
              id={`exp-mobile-${prefix}`}
              min={0}
              max={MAX_EXP}
              step={1}
              value={experience}
              onChange={setExperience}
            />
          </div>
        )}

        {/* БЛОК 3: ОЦЕНКА */}
        {fields?.rating && (
          <div className="bg-white p-4 rounded-2xl">
            <span className="block text-sm font-medium text-foreground mb-3">
              Оценка
            </span>
            <div className="flex flex-col gap-4">
              {RATINGS.map((rate) => (
                <label
                  key={rate}
                  className="flex items-center justify-between cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <StarIcon className="size-5 text-primary" />
                    <span className="text-base text-foreground">{rate}</span>
                  </div>
                  <Radio
                    name={`rating-mobile-${prefix}`}
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
              id={`price-mobile-${prefix}`}
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
