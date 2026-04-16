"use client";

import { FC } from "react";

import Image from "next/image";

import { EditIcon, GeoIcon, RemoveIcon } from "@/shared/assets/icons";
import { StarRating } from "@/shared/ui/star-rating";

import type { UserReview } from "./model";

type Props = {
  review: UserReview;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
};

export const UserReviewCard: FC<Props> = ({ review, onEdit, onDelete }) => {
  const getTitle = () => {
    switch (review.type) {
      case "clinic":
        return review.clinicName;
      case "doctor":
        return review.doctorName;
      case "service":
        return review.serviceName;
      default:
        return "";
    }
  };

  const getSubtitle = () => {
    switch (review.type) {
      case "clinic":
        return (
          <div className="flex items-center gap-1 text-[#838A8D] text-sm mt-0.5">
            <GeoIcon className="w-4 h-4 [&_path]:stroke-[#838A8D] shrink-0" />
            <span className="truncate">{review.clinicAddress}</span>
          </div>
        );
      case "doctor":
        return (
          <p className="text-[#838A8D] text-sm mt-0.5">
            {review.doctorSpecialty}{" "}
            <span className="text-[#F5653E]">• {review.doctorClinic}</span>
          </p>
        );
      case "service":
        return (
          <p className="text-[#838A8D] text-sm mt-0.5">
            {review.serviceCategory}{" "}
            <span className="text-[#F5653E]">• {review.serviceClinic}</span>
          </p>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#E5E6E8] flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {review.image ? (
            <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
              <Image
                src={review.image}
                alt={getTitle() || ""}
                width={48}
                height={48}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-full bg-[#F8F9FA] flex items-center justify-center text-[#838A8D] text-lg font-semibold shrink-0">
              {getTitle()?.charAt(0) || "?"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="text-[#191A1B] font-semibold text-base leading-tight">
              {getTitle()}
            </h3>
            {getSubtitle()}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onEdit && (
            <button
              onClick={() => onEdit(review.id)}
              className="w-10 h-10 rounded-full bg-white border border-[#E5E6E8] flex items-center justify-center hover:bg-[#F8F9FA] transition-colors"
              aria-label="Редактировать"
            >
              <EditIcon className="w-5 h-5 text-[#686F72]" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(review.id)}
              className="w-10 h-10 rounded-full bg-white border border-[#E5E6E8] flex items-center justify-center hover:bg-[#FFE5E0] hover:border-[#FFE5E0] transition-colors"
              aria-label="Удалить"
            >
              <RemoveIcon className="w-5 h-5 [&_path]:stroke-[#F5653E]" />
            </button>
          )}
        </div>
      </div>

      <div className="inline-flex">
        <StarRating rating={review.rating} size={20} />
      </div>

      <p className="text-[#686F72] text-base leading-relaxed">
        {review.comment}
      </p>

      <p className="text-[#838A8D] text-sm">{review.date}</p>
    </div>
  );
};
