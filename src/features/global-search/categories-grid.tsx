"use client";

import { FC } from "react";

import {
  SPECIALIZATION_TILES_LIMIT,
  useSpecializationTiles,
} from "@/entities/specialization";

import { CategoryCard } from "./category/ui";

type Props = {
  onItemClick?: () => void;
};

export const CategoriesGrid: FC<Props> = ({ onItemClick }) => {
  // Тот же хук, что и на Главной, — набор плиток в обоих местах одинаковый.
  const { tiles, isLoading } = useSpecializationTiles();

  if (!isLoading && tiles.length === 0) return null;

  return (
    <div className="p-4 bg-white">
      <h2 className="text-foreground text-lg font-medium mb-3">Категории</h2>
      <div className="grid grid-cols-2 gap-x-3.5 gap-y-3 text-foreground font-medium">
        {isLoading
          ? Array.from({ length: SPECIALIZATION_TILES_LIMIT }).map((_, i) => (
              <div key={i} className="h-15 rounded-2xl skeleton" />
            ))
          : tiles.map(({ name, image, href }) => (
              <CategoryCard
                key={name}
                title={name}
                image={image}
                href={href}
                onClick={onItemClick}
              />
            ))}
      </div>
    </div>
  );
};
