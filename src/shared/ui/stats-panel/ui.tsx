import { FC } from "react";

import { cn } from "@/shared/lib/utils";

type Props = {
  rating: number | string;
  ratingLabel?: string;
  experience: number | string;
  experienceLabel?: string;
  reviews: number | string;
  reviewsLabel?: string;
  className?: string;
};

export const StatsPanel: FC<Props> = ({
  rating,
  ratingLabel = "Оценка",
  experience,
  experienceLabel = "Опыт",
  reviews,
  reviewsLabel = "Отзывов",
  className,
}) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between bg-white border border-[#E3E4E5] rounded-2xl p-4 divide-x divide-[#E3E4E5]",
        className,
      )}
    >
      <div className="flex flex-col items-center flex-1">
        <span className="text-base md:text-[20px] font-medium text-[#191A1B]">
          {rating}
        </span>
        <span className="text-sm text-[#838A8D]">{ratingLabel}</span>
      </div>
      <div className="flex flex-col items-center flex-1">
        <span className="text-base md:text-[20px] font-medium text-[#191A1B]">
          {experience}
        </span>
        <span className="text-sm text-[#838A8D]">{experienceLabel}</span>
      </div>
      <div className="flex flex-col items-center flex-1">
        <span className="text-base md:text-[20px] font-medium text-[#191A1B]">
          {reviews}
        </span>
        <span className="text-sm text-[#838A8D]">{reviewsLabel}</span>
      </div>
    </div>
  );
};
