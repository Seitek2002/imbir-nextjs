"use client";

import { FC } from "react";

import { StarBoldIcon } from "@/shared/assets";

type Props = {
  rating: number;
  maxRating?: number;
  size?: number;
  className?: string;
};

export const StarRating: FC<Props> = ({
  rating,
  maxRating = 5,
  size = 16,
  className = "",
}) => {
  return (
    <div
      className={`inline-flex items-center gap-0.5 px-3 py-1.5 rounded-full bg-[#FFE5E0] ${className}`}
    >
      {Array.from({ length: maxRating }).map((_, index) => (
        <StarBoldIcon
          key={index}
          className="text-primary"
          style={{ width: size, height: size }}
        />
      ))}
    </div>
  );
};
