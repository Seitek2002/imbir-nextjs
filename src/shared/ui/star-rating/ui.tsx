"use client";

import { FC } from "react";

import { StarIcon } from "@/shared/assets/icons";

type Props = {
  rating: number;
  maxRating?: number;
  size?: number;
  className?: string;
};

// Плашка с оценкой — та же, что в публичном виджете отзывов
// (widgets/reviews/ReviewCard.tsx): лососевый фон, белые звёзды, недобранные
// полупрозрачные. Раньше здесь был бледно-розовый фон с оранжевыми звёздами —
// в кабинете отзывы выглядели иначе, чем в макете и на страницах врача/клиники.
export const StarRating: FC<Props> = ({
  rating,
  maxRating = 5,
  size = 16,
  className = "",
}) => {
  return (
    <div
      className={`inline-flex items-center gap-0.5 px-2.5 py-1.5 rounded-full bg-[#FFA18D] ${className}`}
    >
      {Array.from({ length: maxRating }).map((_, index) => (
        <StarIcon
          key={index}
          className={
            index < Math.round(rating) ? "text-white" : "text-white/50"
          }
          style={{ width: size, height: size }}
        />
      ))}
    </div>
  );
};
