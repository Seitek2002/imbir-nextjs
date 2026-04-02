"use client";

import { ChangeEvent, FC, useCallback, useEffect, useState } from "react";

import { cn } from "@/shared/lib/utils";

type Props = {
  label?: string;
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  className?: string;
  labelClassName?: string;
  id?: string;
};

export const RangeSlider: FC<Props> = ({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  className,
  labelClassName,
  id,
}) => {
  const [minVal, setMinVal] = useState(value[0]);
  const [maxVal, setMaxVal] = useState(value[1]);

  // Синхронизация с внешним стейтом (например, при сбросе фильтров)
  useEffect(() => {
    setMinVal(value[0]);
    setMaxVal(value[1]);
  }, [value]);

  // Вычисляем проценты для закрашивания активной полосы
  const getPercent = useCallback(
    (val: number) => Math.round(((val - min) / (max - min)) * 100),
    [min, max],
  );

  const handleMinChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), maxVal - step);
    setMinVal(val);
    onChange([val, maxVal]);
  };

  const handleMaxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), minVal + step);
    setMaxVal(val);
    onChange([minVal, val]);
  };

  return (
    <div className={cn("block w-full", className)}>
      {/* Лейбл (Стаж, лет) */}
      {label && (
        <span
          className={cn(
            "block text-[#0D0D12] text-sm font-medium mb-1.5",
            labelClassName,
          )}
        >
          {label}
        </span>
      )}

      {/* Контейнер в стиле инпута (с бордером) */}
      <div className="border border-[#E3E4E5] rounded-lg p-3 pt-2">
        {/* Значения по краям */}
        <div className="flex justify-between text-sm text-[#191A1B] leading-none">
          <span>{minVal}</span>
          <span>{maxVal}</span>
        </div>

        {/* Трек и ползунки */}
        <div className="relative w-full flex items-center h-4">
          {/* Фоновая (серая) полоса */}
          <div className="absolute w-full h-0.5 bg-[#E3E4E5] rounded-full" />

          {/* Активная (оранжевая) полоса */}
          <div
            className="absolute h-0.5 bg-[#F5653E] rounded-full"
            style={{
              left: `${getPercent(minVal)}%`,
              width: `${getPercent(maxVal) - getPercent(minVal)}%`,
            }}
          />

          {/* Ползунок MIN */}
          <input
            id={id ? `${id}-min` : undefined}
            type="range"
            min={min}
            max={max}
            step={step}
            value={minVal}
            onChange={handleMinChange}
            className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:bg-[#F5653E] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer z-20"
          />

          {/* Ползунок MAX */}
          <input
            id={id ? `${id}-max` : undefined}
            type="range"
            min={min}
            max={max}
            step={step}
            value={maxVal}
            onChange={handleMaxChange}
            className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:bg-[#F5653E] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer z-20"
          />
        </div>
      </div>
    </div>
  );
};
