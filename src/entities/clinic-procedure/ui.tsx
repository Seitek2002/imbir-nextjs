"use client";

import { FC, useState } from "react";

import Image from "next/image";
import Link from "next/link";

import { StarIcon } from "@/shared/assets";

type Props = {
  id: string;
  name: string;
  category: string;
  clinic: string;
  price: number;
  image?: string;
  reviews?: number;
  onDelete?: (id: string) => void;
};

export const ProcedureCard: FC<Props> = ({
  id,
  name,
  category,
  clinic,
  price,
  image,
  reviews,
  onDelete,
}) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="bg-white rounded-3xl border border-[#E3E4E5] p-2 relative group">
      {/* Delete Button */}
      {onDelete && (
        <button
          onClick={() => onDelete(id)}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white border border-[#E5E6E8] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-[#FFF8F5] hover:border-[#F5653E]"
          aria-label="Удалить"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M12 4L4 12M4 4L12 12"
              stroke="#686F72"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}

      <Link href={`/clinic-profile/procedures/${id}`}>
        {/* Photo */}
        <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#FFF8F5] mb-3">
          {image ? (
            <>
              {!loaded && <div className="absolute inset-0 skeleton" />}
              <Image
                src={image}
                alt={name}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 25vw"
                className="object-cover"
                onLoad={() => setLoaded(true)}
              />
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <rect width="80" height="80" fill="#F8F9FA" />
                <path
                  d="M40 20C28.96 20 20 28.96 20 40C20 51.04 28.96 60 40 60C51.04 60 60 51.04 60 40C60 28.96 51.04 20 40 20Z"
                  fill="#E5E6E8"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="px-1">
          <h3 className="font-semibold text-base text-[#191A1B] leading-tight truncate mb-1">
            {name}
          </h3>
          <p className="text-sm text-[#838A8D] truncate mb-2">
            {category} <span className="text-[#F5653E]">• {clinic}</span>
          </p>

          <div className="flex items-center justify-between">
            <span className="text-[#191A1B] font-semibold text-base">
              {price} с
            </span>
            {reviews && (
              <div className="flex items-center gap-1 text-sm">
                <StarIcon className="w-4 h-4 text-[#F5653E]" />
                <span className="text-[#838A8D]">({reviews})</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};
