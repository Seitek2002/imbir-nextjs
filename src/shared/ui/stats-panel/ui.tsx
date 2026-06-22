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
        "flex items-center justify-between bg-white border border-border-soft rounded-2xl p-4 divide-x divide-border-soft",
        className,
      )}
    >
      <div className="flex flex-col items-center flex-1">
        <span className="text-base md:text-[20px] font-medium text-foreground">
          {rating}
        </span>
        <span className="text-sm text-muted">{ratingLabel}</span>
      </div>
      <div className="flex flex-col items-center flex-1">
        <span className="text-base md:text-[20px] font-medium text-foreground">
          {experience}
        </span>
        <span className="text-sm text-muted">{experienceLabel}</span>
      </div>
      <div className="flex flex-col items-center flex-1">
        <span className="text-base md:text-[20px] font-medium text-foreground">
          {reviews}
        </span>
        <span className="text-sm text-muted">{reviewsLabel}</span>
      </div>
    </div>
  );
};
