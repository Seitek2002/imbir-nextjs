"use client";

import { FC, ReactNode } from "react";

import { cn } from "@/shared/lib/utils";

type Tile = {
  label: string;
  value: ReactNode;
};

type Props = {
  tiles: Tile[];
  className?: string;
};

export const StatTiles: FC<Props> = ({ tiles, className }) => (
  <div className={cn("grid grid-cols-2 gap-3", className)}>
    {tiles.map((tile) => (
      <div
        key={tile.label}
        className="bg-white rounded-2xl border border-border p-4"
      >
        <p className="text-2xl font-semibold text-foreground">{tile.value}</p>
        <p className="text-muted text-xs mt-1">{tile.label}</p>
      </div>
    ))}
  </div>
);
