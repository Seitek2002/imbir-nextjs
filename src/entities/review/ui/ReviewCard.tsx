import { FC } from "react";

import Image from "next/image";

import { StarIcon } from "@/shared/assets";

export type ReviewProps = {
  id?: string | number;
  author: string;
  date: string;
  text: string;
  rating: number;
  avatarUrl?: string; // Для будущих реальных фото
};

export const ReviewCard: FC<ReviewProps> = ({
  author,
  date,
  text,
  rating,
  avatarUrl,
}) => {
  return (
    <div className="bg-white border border-[#E3E4E5] rounded-[20px] flex flex-col">
      {/* Верхняя часть: Текст отзыва */}
      <div className="p-5 border-b border-[#E3E4E5]">
        <p className="text-[#686F72] text-[15px] leading-relaxed">{text}</p>
      </div>

      {/* Нижняя часть: Автор и Оценка */}
      <div className="p-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Аватарка */}
          <div className="size-10.5 rounded-full bg-[#E3E4E5] shrink-0 overflow-hidden relative">
            {avatarUrl && (
              <Image
                src={avatarUrl}
                alt={author}
                fill
                className="object-cover"
              />
            )}
          </div>

          <div className="flex flex-col">
            <span className="text-[#191A1B] font-medium text-base">
              {author}
            </span>
            <span className="text-[#838A8D] text-sm mt-0.5">{date}</span>
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
