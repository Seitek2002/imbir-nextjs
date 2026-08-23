"use client";

import { FC } from "react";

import { EditIcon, GeoIcon, TrashIcon } from "@/shared/assets/icons";
import { IconBtn, ImageWithFallback } from "@/shared/ui";
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
        // /api/profile/reviews/ не присылает адрес клиники — показываем
        // строку только если он всё же откуда-то есть, а не пустую иконку.
        return review.clinicAddress ? (
          <div className="flex items-center gap-1 text-muted text-sm mt-0.5">
            <GeoIcon className="w-4 h-4 [&_path]:stroke-muted shrink-0" />
            <span className="truncate">{review.clinicAddress}</span>
          </div>
        ) : null;
      case "doctor":
        // /api/profile/reviews/ отдаёт только имя врача — без специализации и
        // клиники. Без этой проверки под именем висела одинокая точка «•».
        if (!review.doctorSpecialty && !review.doctorClinic) return null;
        return (
          <p className="text-muted text-sm mt-0.5">
            {review.doctorSpecialty}
            {review.doctorClinic && (
              <span className="text-primary"> • {review.doctorClinic}</span>
            )}
          </p>
        );
      case "service":
        if (!review.serviceCategory && !review.serviceClinic) return null;
        return (
          <p className="text-muted text-sm mt-0.5">
            {review.serviceCategory}
            {review.serviceClinic && (
              <span className="text-primary"> • {review.serviceClinic}</span>
            )}
          </p>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-border flex flex-col gap-5 min-w-0">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-full overflow-hidden shrink-0">
            <ImageWithFallback
              src={review.image}
              alt={getTitle() || ""}
              width={48}
              height={48}
              className="w-full h-full object-cover"
              fallback={
                <div className="w-full h-full bg-surface flex items-center justify-center text-muted text-lg font-semibold">
                  {getTitle()?.charAt(0) || "?"}
                </div>
              }
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-foreground font-semibold text-base leading-tight">
              {getTitle()}
            </h3>
            {getSubtitle()}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onEdit && (
            <IconBtn
              onClick={() => onEdit(review.id)}
              variant="outline"
              size="sm"
              aria-label="Редактировать"
            >
              <EditIcon className="w-5 h-5 text-secondary" />
            </IconBtn>
          )}
          {onDelete && (
            <IconBtn
              onClick={() => onDelete(review.id)}
              variant="outline"
              size="sm"
              aria-label="Удалить"
              className="hover:bg-[#FFE5E0] hover:border-[#FFE5E0]"
            >
              <TrashIcon className="w-5 h-5 text-primary" />
            </IconBtn>
          )}
        </div>
      </div>

      <div className="inline-flex">
        <StarRating rating={review.rating} size={20} />
      </div>

      {/* break-words: отзыв из длинной строки без пробелов иначе растягивал
          страницу на десятки тысяч пикселей и добавлял горизонтальный скролл
          всему кабинету. */}
      <p className="text-secondary text-base leading-relaxed break-words">
        {review.comment}
      </p>

      {review.reply && (
        <div className="rounded-2xl bg-surface border border-border-soft p-4">
          <p className="text-foreground font-medium text-sm mb-1">
            Ответ {review.type === "clinic" ? "клиники" : "врача"}
          </p>
          <p className="text-secondary text-sm leading-relaxed break-words">
            {review.reply.text}
          </p>
          {review.reply.date && (
            <p className="text-muted text-xs mt-1">{review.reply.date}</p>
          )}
        </div>
      )}

      <p className="text-muted text-sm">{review.date}</p>
    </div>
  );
};
