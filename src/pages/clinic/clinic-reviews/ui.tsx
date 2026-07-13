"use client";

import { FC, useState } from "react";
import toast from "react-hot-toast";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { ClinicPageLayout } from "@/widgets/clinic/layout";

import {
  clinicCabinetKeys,
  getClinicReviews,
  replyToReview,
} from "@/shared/api";
import { StarIcon } from "@/shared/assets/icons";
import { extractErrorMessage } from "@/shared/lib/errors";
import { Button, Textarea } from "@/shared/ui";

// author бывает и строкой, и объектом {id, full_name} — бэк не консистентен.
const authorName = (author: unknown): string => {
  if (typeof author === "string" && author) return author;
  if (author && typeof author === "object") {
    const name = (author as { full_name?: unknown }).full_name;
    if (typeof name === "string" && name) return name;
  }
  return "Пациент";
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

const Stars: FC<{ rating: number }> = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <StarIcon
        key={n}
        className={`size-4 ${n <= rating ? "text-primary" : "text-border"}`}
      />
    ))}
  </div>
);

export const ClinicReviewsPage: FC = () => {
  const queryClient = useQueryClient();
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: clinicCabinetKeys.reviews(),
    queryFn: getClinicReviews,
  });

  const { mutate: sendReply, isPending: isReplying } = useMutation({
    mutationFn: (vars: { id: number; text: string }) =>
      replyToReview(vars.id, { text: vars.text }),
    onSuccess: () => {
      toast.success("Ответ опубликован");
      queryClient.invalidateQueries({ queryKey: clinicCabinetKeys.reviews() });
      setReplyingId(null);
      setReplyText("");
    },
    onError: (err: unknown) => {
      const errData = (err as { response?: { data?: unknown } })?.response
        ?.data;
      toast.error(extractErrorMessage(errData, "Не удалось отправить ответ"));
    },
  });

  const reviews = data?.data ?? [];

  return (
    <ClinicPageLayout title="Отзывы" mainClassName="flex flex-col gap-4">
      {isLoading ? (
        <div className="bg-white rounded-3xl border border-border px-5 py-12 text-center text-muted text-sm">
          Загрузка...
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-3xl border border-border px-5 py-12 text-center text-muted text-sm">
          Отзывов пока нет
        </div>
      ) : (
        reviews.map((review) => (
          <article
            key={review.id}
            className="bg-white rounded-3xl border border-border p-5"
          >
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="min-w-0">
                <p className="text-foreground font-medium truncate">
                  {authorName(review.author)}
                </p>
                <p className="text-muted text-xs">
                  {formatDate(review.created_at)}
                </p>
              </div>
              <Stars rating={review.rating} />
            </div>

            {review.text && (
              <p className="text-secondary text-sm leading-relaxed">
                {review.text}
              </p>
            )}

            {review.reply ? (
              <div className="mt-3 bg-surface rounded-2xl p-4">
                <p className="text-xs text-muted mb-1">Ваш ответ</p>
                <p className="text-sm text-foreground">{review.reply.text}</p>
              </div>
            ) : replyingId === review.id ? (
              <div className="mt-3 flex flex-col gap-2">
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Ваш ответ пациенту"
                  rows={3}
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setReplyingId(null);
                      setReplyText("");
                    }}
                  >
                    Отмена
                  </Button>
                  <Button
                    size="sm"
                    disabled={!replyText.trim() || isReplying}
                    onClick={() =>
                      sendReply({ id: review.id, text: replyText.trim() })
                    }
                  >
                    {isReplying ? "Отправка..." : "Ответить"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="mt-3">
                <Button
                  variant="text"
                  size="xs"
                  className="px-0 text-primary"
                  onClick={() => setReplyingId(review.id)}
                >
                  Ответить
                </Button>
              </div>
            )}
          </article>
        ))
      )}
    </ClinicPageLayout>
  );
};
