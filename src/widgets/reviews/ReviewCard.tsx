import { FC } from "react";

import { StarIcon } from "@/shared/assets/icons";
import { ImageWithFallback } from "@/shared/ui";

export type ReviewProps = {
  id?: string | number;
  author: string;
  date: string;
  text: string;
  rating: number;
  avatarUrl?: string; // Для будущих реальных фото
  reply?: { text: string; date: string } | null;
};

export const ReviewCard: FC<ReviewProps> = ({
  author,
  date,
  text,
  rating,
  avatarUrl,
  reply,
}) => {
  return (
    <div className="bg-white border border-border-soft rounded-[20px] flex flex-col">
      {/* Верхняя часть: Текст отзыва */}
      <div className="p-5 border-b border-border-soft">
        <p className="text-secondary text-[15px] leading-relaxed">{text}</p>
        {reply && (
          <div className="mt-3 rounded-2xl bg-surface border border-border-soft p-3">
            <p className="text-foreground font-medium text-sm mb-1">Ответ</p>
            <p className="text-secondary text-sm leading-relaxed">
              {reply.text}
            </p>
            {reply.date && (
              <p className="text-muted text-xs mt-1">{reply.date}</p>
            )}
          </div>
        )}
      </div>

      {/* Нижняя часть: Автор и Оценка */}
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Аватарка */}
          <div className="size-10.5 rounded-full bg-border-soft shrink-0 overflow-hidden relative">
            <ImageWithFallback
              src={avatarUrl}
              alt={author}
              fill
              sizes="42px"
              className="object-cover"
              fallback={null}
            />
          </div>

          <div className="flex flex-col">
            <span className="text-foreground font-medium text-base">
              {author}
            </span>
            <span className="text-muted text-sm mt-0.5">{date}</span>
          </div>
        </div>

        {/* Звезды в оранжевой плашке */}
        <div className="flex items-center bg-[#FFA18D] py-1.5 px-2.5 rounded-full gap-0.5">
          {/* Отрисовка 5 звезд. Если рейтинг меньше 5, остальные будут полупрозрачными */}
          {[...Array(5)].map((_, i) => (
            <StarIcon
              key={i}
              className={`size-3.5 ${i < rating ? "text-white" : "text-white/50"}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
