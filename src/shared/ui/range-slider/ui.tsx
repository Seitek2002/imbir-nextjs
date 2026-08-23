"use client";

import {
  ChangeEvent,
  FC,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@/shared/lib/utils";

type Props = {
  label?: string;
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  // Необязателен: если значение нужно только по окончании перетаскивания
  // (например, чтобы не дёргать сервер на каждый шаг), передавайте лишь
  // onChangeEnd — цифры на концах трека всё равно двигаются, они локальные.
  onChange?: (value: [number, number]) => void;
  onChangeEnd?: (value: [number, number]) => void;
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
  onChangeEnd,
  className,
  labelClassName,
  id,
}) => {
  const [minVal, setMinVal] = useState(value[0]);
  const [maxVal, setMaxVal] = useState(value[1]);
  const minValRef = useRef(value[0]);
  const maxValRef = useRef(value[1]);

  // Синхронизация с внешним стейтом (например, при сбросе фильтров)
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setMinVal(value[0]);
    setMaxVal(value[1]);
    minValRef.current = value[0];
    maxValRef.current = value[1];
  }, [value]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Вычисляем проценты для закрашивания активной полосы
  const getPercent = useCallback(
    (val: number) => Math.round(((val - min) / (max - min)) * 100),
    [min, max],
  );

  const handleMinChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = Math.min(Number(e.target.value), maxVal - step);
    minValRef.current = val;
    setMinVal(val);
    onChange?.([val, maxVal]);
  };

  const handleMaxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(Number(e.target.value), minVal + step);
    maxValRef.current = val;
    setMaxVal(val);
    onChange?.([minVal, val]);
  };

  const handleChangeEnd = () => {
    onChangeEnd?.([minValRef.current, maxValRef.current]);
  };

  return (
    <div className={cn("block w-full", className)}>
      {/* Лейбл (Стаж, лет) */}
      {label && (
        <span
          className={cn(
            "block text-overlay text-sm font-medium mb-1.5",
            labelClassName,
          )}
        >
          {label}
        </span>
      )}

      {/* Контейнер в стиле инпута (с бордером) */}
      <div className="border border-border-soft rounded-lg p-3 pt-2">
        {/* Значения по краям */}
        <div className="flex justify-between text-sm text-foreground leading-none">
          <span>{minVal}</span>
          <span>{maxVal}</span>
        </div>

        {/* Трек и ползунки */}
        <div className="relative w-full flex items-center h-4">
          {/* Фоновая (серая) полоса */}
          <div className="absolute w-full h-0.5 bg-border-soft rounded-full" />

          {/* Активная (оранжевая) полоса */}
          <div
            className="absolute h-0.5 bg-primary rounded-full"
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
            onPointerUp={handleChangeEnd}
            onKeyUp={handleChangeEnd}
            className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer z-20"
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
            onPointerUp={handleChangeEnd}
            onKeyUp={handleChangeEnd}
            className="absolute w-full appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer z-20"
          />
        </div>
      </div>
    </div>
  );
};
