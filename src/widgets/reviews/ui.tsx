"use client";

import { FC, useState } from "react";

import Link from "next/link";

import { ChatIcon, StarIcon } from "@/shared/assets/icons";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui";

import { ReviewCard } from "./ReviewCard";

// Тип для отдельного отзыва
export type ReviewItem = {
  id: string | number;
  author: string;
  date: string;
  text: string;
  rating: number;
  avatarUrl?: string;
  reply?: { text: string; date: string } | null;
};

type Props = {
  initialReviews: ReviewItem[];
  averageRating: number;
  // Отправка отзыва на бэк. Если не передана — форма не показывается.
  onSubmitReview?: (rating: number, text: string) => void;
  isSubmitting?: boolean;
};

export const ReviewsSection: FC<Props> = ({
  initialReviews,
  averageRating,
  onSubmitReview,
  isSubmitting,
}) => {
  // Источник истины — проп (данные из query); локально держим только форму.
  const reviews = initialReviews;
  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(0);

  const handleAddReview = () => {
    if (!newReviewText.trim() || newReviewRating === 0 || !onSubmitReview)
      return;

    onSubmitReview(newReviewRating, newReviewText);
    setNewReviewText("");
    setNewReviewRating(0);
  };

  return (
    <div className="mt-10 md:mt-20 mb-10 md:mb-20 md:px-0 bg-white rounded-[20px] p-4 mx-2">
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <h2 className="text-2xl font-semibold text-foreground">Отзывы</h2>
        <Link
          href="#"
          className="md:hidden text-primary text-sm font-medium hover:underline"
        >
          Все
        </Link>
      </div>

      <div className="flex flex-col md:flex-row gap-6 md:gap-10">
        <div className="w-full md:w-[320px] shrink-0 flex flex-col gap-5">
          {/* Статистика */}
          <div className="flex gap-4">
            <div className="flex-1 bg-white md:bg-transparent border border-border-soft rounded-2xl p-6 flex flex-col items-center md:items-start justify-center">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-[#FFA18D] p-2.5 rounded-xl size-10 flex items-center justify-center">
                  <StarIcon className="size-5 text-white" />
                </div>
                <span className="text-[24px] font-semibold text-foreground">
                  {averageRating}
                </span>
              </div>
              <span className="text-muted">Средняя оценка</span>
            </div>

            <div className="flex-1 bg-white md:bg-transparent border border-border-soft rounded-2xl p-6 flex flex-col items-center md:items-start justify-center">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-[#FFA18D] p-2.5 rounded-xl size-10 flex items-center justify-center">
                  <ChatIcon className="size-5 text-white" />
                </div>
                <span className="text-[24px] font-semibold text-foreground">
                  {reviews.length}
                </span>
              </div>
              <span className="text-muted">Всего отзывов</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="md:hidden w-full justify-center bg-white"
          >
            Оставить свой отзыв
          </Button>

          {/* Форма — только если подключена отправка на бэк */}
          {onSubmitReview && (
            <div className="hidden md:flex flex-col bg-white border border-border-soft rounded-2xl p-4">
              <h3 className="font-medium text-[20px] text-foreground mb-6">
                Оставьте свой отзыв
              </h3>
              <span className="text-base mb-2">Оцените специалиста</span>

              {/* Интерактивные Звездочки */}
              <div className="flex justify-center gap-5 py-4 mb-6 border border-border rounded-xl">
                {[1, 2, 3, 4, 5].map((star) => (
                  <StarIcon
                    key={star}
                    onClick={() => setNewReviewRating(star)}
                    className={cn(
                      "size-10 cursor-pointer transition-colors",
                      star <= newReviewRating ? "text-primary" : "text-border",
                    )}
                  />
                ))}
              </div>

              <span className="text-base mb-2">Поделитесь своим мнением</span>
              <textarea
                value={newReviewText}
                onChange={(e) => setNewReviewText(e.target.value)}
                className="w-full border border-border-soft rounded-xl p-3 text-sm outline-none focus:border-primary resize-none h-24 mb-4"
                placeholder="Введите текст"
              />

              <Button
                size="md"
                className="w-full justify-center"
                onClick={handleAddReview}
                disabled={
                  !newReviewText.trim() || newReviewRating === 0 || isSubmitting
                }
              >
                {isSubmitting ? "Отправка..." : "Отправить"}
              </Button>
            </div>
          )}
        </div>

        {/* Список отзывов */}
        <div className="flex-1 flex flex-col gap-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              author={review.author}
              date={review.date}
              text={review.text}
              rating={review.rating}
              avatarUrl={review.avatarUrl}
              reply={review.reply}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
