"use client";

import { FC, useState } from "react";

import { useSearchParams } from "next/navigation";

import { Dropdown, IconBtn, RangeSlider } from "@/shared";

import { GeoIcon } from "@/shared/assets";

const MAX_EXP = 50;

export const FilterBar: FC = () => {
  const searchParams = useSearchParams();
  const initialExp = searchParams.get("exp")?.split("-").map(Number);
  const [experience, setExperience] = useState<[number, number]>([
    initialExp?.[0] ?? 0,
    initialExp?.[1] ?? 10,
  ]);

  return (
    <div className="py-30">
      <div className="max-w-127.25 flex items-center">
        <h2 className="border-r border-r-[#E5E6E8] text-[40px] font-semibold pr-6">
          Специалисты
        </h2>
        <div className="flex items-center gap-2 ml-4">
          <IconBtn size="md">
            {/* Надо менять цвет SVG вот так */}
            <GeoIcon className="size-5 [&_path]:stroke-white" />
          </IconBtn>
          <div>
            <div>г. Бишкек</div>
            <div className="text-[#838A8D]">Ленинский район</div>
          </div>
        </div>
      </div>
      <p className="text-[#686F72] text-lg mt-4">
        Выберите интересующие вас параметры, чтобы ознакомиться с подходящими
        врачами
      </p>
      <div className="grid grid-cols-2 items-center">
        <Dropdown
          label="Специализация"
          placeholder="Выберите специализацию"
          options={[]}
        />
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
      </div>
    </div>
  );
};
