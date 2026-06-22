"use client";

import { FC, ReactNode } from "react";

import { useRouter } from "next/navigation";

type Props = {
  title: string;
  rightElement?: ReactNode;
  hasBorder?: boolean;
};

export const MobilePageHeader: FC<Props> = ({
  title,
  rightElement,
  hasBorder = false,
}) => {
  const router = useRouter();

  return (
    <div
      className={`md:hidden flex items-center justify-between px-4 py-4 bg-white${hasBorder ? " border-b border-border" : ""}`}
    >
      <button
        onClick={() => router.back()}
        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface transition-colors"
        aria-label="Назад"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M15 18L9 12L15 6"
            stroke={colors.foreground}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <h1 className="text-lg font-semibold text-foreground">{title}</h1>

      <div className="w-10 flex items-center justify-center">
        {rightElement ?? null}
      </div>
    </div>
  );
};
