"use client";

import { FC } from "react";

import { useRouter } from "next/navigation";

type Props = {
  title: string;
};

export const ClinicMobileHeader: FC<Props> = ({ title }) => {
  const router = useRouter();

  return (
    <div className="md:hidden flex items-center justify-between px-4 py-4 bg-white border-b border-[#E5E6E8]">
      <button
        onClick={() => router.back()}
        className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#F8F9FA] transition-colors"
        aria-label="Назад"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M15 18L9 12L15 6"
            stroke="#191A1B"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <h1 className="text-lg font-semibold text-[#191A1B]">{title}</h1>

      <div className="w-10" />
    </div>
  );
};
