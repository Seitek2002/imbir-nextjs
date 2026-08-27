"use client";

import { FC, useState } from "react";

import { StarBoldIcon, StarOutlineIcon } from "@/shared/assets/icons";
import { Button } from "@/shared/ui";

type Props = {
  commentLabel?: string;
  initialComment?: string;
  initialRating?: number;
  // Может вернуть промис — тогда форма очистится только после успеха.
  onSubmit: (rating: number, comment: string) => Promise<unknown> | void;
  // Вызывается после удачной отправки: модалке нужно закрыться, странице — нет.
  onSubmitted?: () => void;
  ratingLabel?: string;
  submitLabel?: string;
};

// Оценка + текст + отправка. Раньше этот блок жил только внутри ReviewModal,
// и странице всех отзывов пришлось бы завести третью копию (вторая — свёрнутая
// форма в widgets/reviews). Логика тут одна на всех: сбрасываем поля только
// после успеха, при ошибке текст остаётся, чтобы можно было повторить.
export const ReviewForm: FC<Props> = ({
  onSubmit,
  onSubmitted,
  initialRating = 0,
  initialComment = "",
  ratingLabel = "Оцените специалиста",
  commentLabel = "Поделитесь своим мнением о специалисте",
  submitLabel = "Отправить",
}) => {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0 || isSending) return;
    setIsSending(true);
    try {
      await onSubmit(rating, comment);
      setRating(0);
      setComment("");
      onSubmitted?.();
    } catch {
      // Сообщение показывает вызывающий (onError мутации). Поля не трогаем.
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className="block text-foreground font-medium text-base mb-3">
          {ratingLabel}
        </label>
        <div className="flex items-center gap-2 p-4 bg-surface rounded-2xl justify-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              aria-label={`Оценка ${star}`}
              onClick={() => setRating(star)}
              className="transition-transform hover:scale-110 cursor-pointer"
            >
              {star <= rating ? (
                <StarBoldIcon className="w-10 h-10 text-primary" />
              ) : (
                <StarOutlineIcon className="w-10 h-10 text-border" />
              )}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-foreground font-medium text-base mb-3">
          {commentLabel}
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Введите текст"
          rows={5}
          className="w-full p-4 rounded-2xl border border-border text-foreground placeholder:text-dim focus:outline-none focus:border-primary resize-none transition-colors"
        />
      </div>

      <Button
        size="lg"
        className="w-full"
        onClick={handleSubmit}
        disabled={rating === 0 || isSending}
        loading={isSending}
      >
        {submitLabel}
      </Button>
    </div>
  );
};
