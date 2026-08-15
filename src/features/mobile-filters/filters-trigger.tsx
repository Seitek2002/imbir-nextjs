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
    <IconBtn variant="outline" size="sm" onClick={handleOpen}>
      <FilterSample />
    </IconBtn>
  );
};
