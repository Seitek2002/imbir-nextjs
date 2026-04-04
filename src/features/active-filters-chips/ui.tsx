"use client";

import { FC } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { RemoveIcon, StarIcon } from "@/shared/assets";

const SPECIALTY_DICT: Record<string, string> = {
  cardiologist: "Кардиолог",
  therapist: "Терапевт",
  surgeon: "Хирург",
  dentist: "Стоматолог",
  // Добавь сюда акушера-гинеколога, если он появился в опциях
};

export const ActiveFiltersChips: FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Достаем параметры из URL
  const specs = searchParams.get("spec")?.split(",").filter(Boolean) || [];
  const rating = searchParams.get("rating");
  // Можно добавить exp и price по аналогии, если хочешь выводить и их

  // Функция для удаления конкретного фильтра
  const removeFilter = (key: string, valueToRemove?: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (key === "spec" && valueToRemove) {
      // Удаляем только один конкретный spec из массива
      const newSpecs = specs.filter((s) => s !== valueToRemove);
      if (newSpecs.length > 0) {
        params.set("spec", newSpecs.join(","));
      } else {
        params.delete("spec");
      }
    } else {
      params.delete(key);
    }

    // Обновляем URL без перезагрузки страницы
    router.replace(`${pathname}?${params.toString()}`);
  };

  // Если фильтров нет, ничего не рендерим
  if (!specs.length && !rating) return null;

  return (
    // Горизонтальный скролл для мобилок, скрыт на десктопе
    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide mt-3 md:hidden">
      {/* Рендерим плашки специализаций */}
      {specs.map((spec) => (
        <div
          key={spec}
          className="flex items-center gap-1 px-2 py-0.75 bg-white border border-[#E5E6E8] rounded-sm shrink-0"
        >
          <span className="text-sm text-[#191A1B] font-medium">
            {SPECIALTY_DICT[spec] || spec}
          </span>
          <button
            onClick={() => removeFilter("spec", spec)}
            className="text-[#838A8D] hover:text-[#F5653E] transition-colors"
          >
            <RemoveIcon className="size-4" />
          </button>
        </div>
      ))}

      {/* Рендерим плашку рейтинга (со звездочкой, как на макете) */}
      {rating && (
        <div className="flex items-center gap-1 px-2 py-0.75 bg-white border border-[#E5E6E8] rounded-sm shrink-0">
          <StarIcon className="size-4 text-[#F5653E]" />
          <span className="text-sm text-[#191A1B] font-medium">{rating}</span>
          <button
            onClick={() => removeFilter("rating")}
            className="text-[#838A8D] hover:text-[#F5653E] transition-colors"
          >
            <RemoveIcon className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
};
