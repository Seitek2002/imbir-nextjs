"use client";

import { FC } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { RemoveIcon, StarIcon } from "@/shared/assets";

type Props = {
  prefix: string; // Обязательный префикс (doc или clinic)
};

export const ActiveFiltersChips: FC<Props> = ({ prefix }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Достаем параметры из URL с учетом префикса
  const specs =
    searchParams.get(`${prefix}_spec`)?.split(",").filter(Boolean) || [];
  const rating = searchParams.get(`${prefix}_rating`);
  const experience = searchParams.get(`${prefix}_exp`);
  const price = searchParams.get(`${prefix}_price`);

  // Функция для удаления конкретного фильтра
  const removeFilter = (key: string, valueToRemove?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const fullKey = `${prefix}_${key}`;

    if (key === "spec" && valueToRemove) {
      // Удаляем только один конкретный spec из массива
      const newSpecs = specs.filter((s) => s !== valueToRemove);
      if (newSpecs.length > 0) {
        params.set(fullKey, newSpecs.join(","));
      } else {
        params.delete(fullKey);
      }
    } else {
      // Удаляем параметр целиком (рейтинг, стаж или цена)
      params.delete(fullKey);
    }

    // Обновляем URL без перезагрузки страницы
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Если фильтров нет, ничего не рендерим
  if (!specs.length && !rating && !experience && !price) return null;

  return (
    // Горизонтальный скролл для мобилок
    <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide mt-3 md:hidden">
      {/* 1. Плашки специализаций */}
      {specs.map((spec) => (
        <div
          key={spec}
          className="flex items-center gap-1 px-2 py-1 bg-white border border-[#E5E6E8] rounded-sm shrink-0"
        >
          <span className="text-sm text-[#191A1B] font-medium">{spec}</span>
          <button
            onClick={() => removeFilter("spec", spec)}
            className="text-[#838A8D] hover:text-[#F5653E] transition-colors"
          >
            <RemoveIcon className="size-4" />
          </button>
        </div>
      ))}

      {/* 2. Плашка рейтинга */}
      {rating && rating !== "all" && (
        <div className="flex items-center gap-1 px-2 py-1 bg-white border border-[#E5E6E8] rounded-sm shrink-0">
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

      {/* 3. Плашка стажа */}
      {experience && (
        <div className="flex items-center gap-1 px-2 py-1 bg-white border border-[#E5E6E8] rounded-sm shrink-0">
          <span className="text-sm text-[#191A1B] font-medium">
            Стаж: {experience}
          </span>
          <button
            onClick={() => removeFilter("exp")}
            className="text-[#838A8D] hover:text-[#F5653E] transition-colors"
          >
            <RemoveIcon className="size-4" />
          </button>
        </div>
      )}

      {/* 4. Плашка стоимости */}
      {price && (
        <div className="flex items-center gap-1 px-2 py-1 bg-white border border-[#E5E6E8] rounded-sm shrink-0">
          <span className="text-sm text-[#191A1B] font-medium">
            Цена: {price}
          </span>
          <button
            onClick={() => removeFilter("price")}
            className="text-[#838A8D] hover:text-[#F5653E] transition-colors"
          >
            <RemoveIcon className="size-4" />
          </button>
        </div>
      )}
    </div>
  );
};
