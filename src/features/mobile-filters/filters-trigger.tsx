"use client";

import { FC } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { IconBtn } from "@/shared";

import { FilterSample } from "@/shared/assets";

export const FiltersTrigger: FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleOpen = () => {
    // Берем все текущие параметры (чтобы не сбросить поиск)
    const params = new URLSearchParams(searchParams.toString());
    // Добавляем флаг открытия модалки
    params.set("modal", "filters");

    // Пушим в историю, чтобы сработал свайп назад
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <IconBtn variant="outline" size="sm" onClick={handleOpen}>
      <FilterSample />
    </IconBtn>
  );
};
