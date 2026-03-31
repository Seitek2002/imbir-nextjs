"use client";

import { ChangeEvent, FC, useCallback, useEffect, useState } from "react";

import { cn } from "@/shared/lib/utils";

type Props = {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  className?: string;
};

export const RangeSlider: FC<Props> = ({
  min,
  max,
  step = 1,
  value,
  onChange,
  className,
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
    <div className={cn("relative w-full flex items-center h-6", className)}>
      {/* Фоновая (серая) полоса */}
      <div className="absolute w-full h-1 bg-[#E3E4E5] rounded-full" />

      {/* Активная (оранжевая) полоса */}
      <div
        className="absolute h-1 bg-[#F5653E] rounded-full"
        style={{
          left: `${getPercent(minVal)}%`,
          width: `${getPercent(maxVal) - getPercent(minVal)}%`,
        }}
      />

      {/* Ползунок MIN */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={minVal}
        onChange={handleMinChange}
        className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#F5653E] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer z-20"
      />

      {/* Ползунок MAX */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={maxVal}
        onChange={handleMaxChange}
        className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-[#F5653E] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer z-20"
      />
    </div>
  );
};
