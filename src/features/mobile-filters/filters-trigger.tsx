"use client";

import { FC } from "react";

import { FilterSample } from "@/shared/assets/icons";
import { pushUrlState, useUrlSearchParams } from "@/shared/lib/url-state";
import { IconBtn } from "@/shared/ui";

export const FiltersTrigger: FC = () => {
  const searchParams = useUrlSearchParams();

  const handleOpen = () => {
    // Берем все текущие параметры (чтобы не сбросить поиск)
    const params = new URLSearchParams(searchParams.toString());
    // Добавляем флаг открытия модалки
    params.set("modal", "filters");

    // Пушим в историю, чтобы сработал свайп назад
    pushUrlState(params);
  };

  return (
    // Кнопка только с иконкой — без aria-label читалка объявляла её просто
    // «кнопка», и понять, что она открывает фильтры, было нельзя.
    <IconBtn
      variant="outline"
      size="sm"
      onClick={handleOpen}
      aria-label="Открыть фильтры"
    >
      <FilterSample />
    </IconBtn>
  );
};
