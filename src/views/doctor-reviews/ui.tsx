"use client";

import { FC, useCallback, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { DoctorPageLayout } from "@/widgets/doctor-page-layout";

import { DoctorReview, useDoctorCabinet } from "@/entities/doctor-profile";

import { getReviews } from "@/shared/api/reviews/requests";
import type { ReviewAuthor } from "@/shared/api/reviews/types";
import { useScrollLock } from "@/shared/lib/useScrollLock";

const resolveAuthorName = (author: ReviewAuthor): string => {
  if (typeof author === "string") return author;
  return author.full_name;
};

const DURATION = 200;

const StarFilled = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill={colors.primary}>
    <path d="M7 1L8.85 4.83L13 5.43L10 8.36L10.71 12.5L7 10.54L3.29 12.5L4 8.36L1 5.43L5.15 4.83L7 1Z" />
  </svg>
);

type ReplyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  reviewAuthor: string;
  onSubmit: (text: string) => void;
};

const ReplyModal: FC<ReplyModalProps> = ({
  isOpen,
  onClose,
  reviewAuthor,
  onSubmit,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [text, setText] = useState("");

  useScrollLock(isOpen);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, DURATION);
  }, [onClose]);

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSubmit(text);
    setText("");
    handleClose();
  };

  if (!isOpen && !isClosing) return null;
  const state = isClosing ? "closed" : "open";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div
        className="modal-overlay absolute inset-0 bg-black/50"
        data-state={state}
        onClick={handleClose}
      />
      <div
        className="modal-panel relative bg-white rounded-3xl w-full sm:max-w-md overflow-hidden"
        data-state={state}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Ответ на отзыв
          </h2>
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5"
                stroke={colors.secondary}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-muted text-sm">В ответ {reviewAuthor}</p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Введите текст"
            rows={4}
            className="w-full px-4 py-3 rounded-2xl border border-border text-foreground placeholder:text-dim focus:outline-none focus:border-primary resize-none transition-colors"
          />
          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 py-3.5 rounded-full border border-border-soft text-foreground font-medium hover:bg-background transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 py-3.5 rounded-full bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
            >
              Отправить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const COMPLAINT_REASONS = [
  "Спам или реклама",
  "Оскорбительное содержание",
  "Ложная информация",
  "Нарушение конфиденциальности",
  "Другие",
];

type ComplaintModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const ComplaintModal: FC<ComplaintModalProps> = ({ isOpen, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [reason, setReason] = useState("");
  const [comment, setComment] = useState("");

  useScrollLock(isOpen);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, DURATION);
  }, [onClose]);

  if (!isOpen && !isClosing) return null;
  const state = isClosing ? "closed" : "open";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div
        className="modal-overlay absolute inset-0 bg-black/50"
        data-state={state}
        onClick={handleClose}
      />
      <div
        className="modal-panel relative bg-white rounded-3xl w-full sm:max-w-md overflow-hidden"
        data-state={state}
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Пожаловаться
          </h2>
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-surface transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path
                d="M13.5 4.5L4.5 13.5M4.5 4.5L13.5 13.5"
                stroke={colors.secondary}
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div className="p-5 space-y-3">
          <p className="text-muted text-sm mb-1">Выберите причину жалобы</p>
          {COMPLAINT_REASONS.map((r) => (
            <label
              key={r}
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => setReason(r)}
            >
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${reason === r ? "border-primary" : "border-dim"}`}
              >
                {reason === r && (
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                )}
              </div>
              <span
                className={`text-sm ${reason === r ? "text-primary font-medium" : "text-foreground"}`}
              >
                {r}
              </span>
            </label>
          ))}
          <div className="pt-2">
            <label className="block text-muted text-sm mb-1.5">
              Опишите причину
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Введите текст"
              rows={3}
              className="w-full px-4 py-3 rounded-2xl border border-border text-foreground placeholder:text-dim focus:outline-none focus:border-primary resize-none transition-colors"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button
              onClick={handleClose}
              className="flex-1 py-3.5 rounded-full border border-border-soft text-foreground font-medium hover:bg-background transition-colors"
            >
              Отмена
            </button>
            <button
              onClick={() => {
                setReason("");
                setComment("");
                handleClose();
              }}
              className="flex-1 py-3.5 rounded-full bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
            >
              Отправить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

type ReviewCardProps = {
  review: DoctorReview;
  onReply: (r: DoctorReview) => void;
  onComplain: (r: DoctorReview) => void;
};

const ReviewCard: FC<ReviewCardProps> = ({ review, onReply, onComplain }) => (
  <div className="p-5 border-b border-border last:border-0">
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#FFF0EE] flex items-center justify-center shrink-0">
          <span className="text-primary font-semibold text-sm">
            {review.authorInitial}
          </span>
        </div>
        <div>
          <p className="text-foreground font-medium text-sm">
            {review.authorName}
          </p>
          <div className="flex items-center gap-0.5 mt-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <StarFilled key={i} />
            ))}
          </div>
        </div>
      </div>
      <span className="text-muted text-xs shrink-0">{review.date}</span>
    </div>
    <p className="text-foreground text-sm mt-3 leading-relaxed">
      {review.text}
    </p>
    {review.replyTime && (
      <p className="text-muted text-xs mt-2">{review.replyTime}</p>
    )}
    <div className="flex items-center gap-4 mt-3">
      <button
        onClick={() => onReply(review)}
        className="text-muted text-xs flex items-center gap-1 hover:text-primary transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M1.5 2.5H12.5V9.5H8L5 12V9.5H1.5V2.5Z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Ответить
      </button>
      <button
        onClick={() => onComplain(review)}
        className="text-muted text-xs flex items-center gap-1 hover:text-primary transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path
            d="M7 1L13 13H1L7 1Z"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7 5.5V7.5M7 9.5V10"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
        Пожаловаться
      </button>
    </div>
  </div>
);

export const DoctorReviewsPage: FC = () => {
  const { profile, rawProfile } = useDoctorCabinet();
  const [replyTarget, setReplyTarget] = useState<DoctorReview | null>(null);
  const [complaintTarget, setComplaintTarget] = useState<DoctorReview | null>(
    null,
  );

  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ["doctor-reviews", rawProfile?.id],
    queryFn: () => getReviews("doctor", rawProfile!.id),
    enabled: !!rawProfile?.id,
  });

  const reviews: DoctorReview[] = (reviewsData?.data ?? []).map((r) => {
    const name = resolveAuthorName(r.author);
    return {
      id: String(r.id),
      authorName: name,
      authorInitial: name.charAt(0).toUpperCase(),
      rating: r.rating,
      date: r.created_at.slice(0, 10),
      text: r.text,
    };
  });

  return (
    <>
      <DoctorPageLayout title="Отзывы">
        <h2 className="text-[28px] font-semibold text-foreground mb-6 hidden lg:block">
          Отзывы
        </h2>

        <div className="bg-white rounded-3xl border border-border p-5 mb-4 flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-foreground">
              {profile?.rating ?? "—"}
            </span>
            <div className="flex flex-col">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarFilled key={i} />
                ))}
              </div>
              <span className="text-muted text-xs mt-0.5">Средняя оценка</span>
            </div>
          </div>
          <div className="w-px h-10 bg-border" />
          <div>
            <span className="text-3xl font-bold text-foreground">
              {profile?.totalReviews ?? "—"}
            </span>
            <p className="text-muted text-xs mt-0.5">Всего отзывов</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-border overflow-hidden">
          {isLoading ? (
            <div className="p-10 text-center text-muted text-sm">
              Загрузка...
            </div>
          ) : reviews.length === 0 ? (
            <div className="p-10 text-center text-muted text-sm">
              Отзывов пока нет
            </div>
          ) : (
            reviews.map((r) => (
              <ReviewCard
                key={r.id}
                review={r}
                onReply={setReplyTarget}
                onComplain={setComplaintTarget}
              />
            ))
          )}
        </div>
      </DoctorPageLayout>

      <ReplyModal
        isOpen={!!replyTarget}
        onClose={() => setReplyTarget(null)}
        reviewAuthor={replyTarget?.authorName ?? ""}
        onSubmit={() => setReplyTarget(null)}
      />
      <ComplaintModal
        isOpen={!!complaintTarget}
        onClose={() => setComplaintTarget(null)}
      />
    </>
  );
};
