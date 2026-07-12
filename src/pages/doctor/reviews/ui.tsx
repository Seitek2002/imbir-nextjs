"use client";

import { FC, useCallback, useState } from "react";
import toast from "react-hot-toast";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  DoctorPageLayout,
  DoctorReview,
  useDoctorCabinet,
} from "@/widgets/doctor/layout";

import {
  type ReviewAuthor,
  doctorCabinetKeys,
  getDoctorReviews,
  replyToReview,
} from "@/shared/api";
import { ChatIcon, StarIcon } from "@/shared/assets/icons";
import { colors } from "@/shared/config";
import { extractErrorMessage } from "@/shared/lib/errors";
import { useScrollLock } from "@/shared/lib/useScrollLock";

const resolveAuthorName = (author?: ReviewAuthor): string => {
  if (!author) return "Аноним";
  if (typeof author === "string") return author;
  return author.full_name;
};

const DURATION = 200;

const MONTHS = [
  "Января",
  "Февраля",
  "Марта",
  "Апреля",
  "Мая",
  "Июня",
  "Июля",
  "Августа",
  "Сентября",
  "Октября",
  "Ноября",
  "Декабря",
];

// "2025-11-20..." → "20 Ноября, 2025" (как в макете).
const fmtReviewDate = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
};

// Плашка со звёздами — тот же стиль, что в виджете отзывов на страницах
// деталей врача/клиники/услуги (@/widgets/reviews).
const StarPill: FC<{ rating: number }> = ({ rating }) => (
  <div className="flex items-center bg-[#FFA18D] py-1.5 px-2.5 rounded-full gap-0.5 shrink-0">
    {Array.from({ length: 5 }).map((_, i) => (
      <StarIcon
        key={i}
        className={`size-3.5 ${i < rating ? "text-white" : "text-white/50"}`}
      />
    ))}
  </div>
);

type ReplyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  reviewAuthor: string;
  initialText?: string;
  onSubmit: (text: string) => void;
};

const ReplyModal: FC<ReplyModalProps> = ({
  isOpen,
  onClose,
  reviewAuthor,
  initialText = "",
  onSubmit,
}) => {
  const [isClosing, setIsClosing] = useState(false);
  const [text, setText] = useState(initialText);

  // Модалка не размонтируется между открытиями — подставляем текущий текст
  // ответа (для правки) при каждом открытии («adjust state during render»).
  const [wasOpen, setWasOpen] = useState(false);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) setText(initialText);
  }

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
  <div className="bg-white border border-border-soft rounded-[20px] p-5">
    {/* Шапка: автор + дата, справа — плашка со звёздами */}
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="size-10.5 rounded-full bg-[#FFF0EE] flex items-center justify-center shrink-0">
          <span className="text-primary font-semibold">
            {review.authorInitial}
          </span>
        </div>
        <div>
          <p className="text-foreground font-medium text-base">
            {review.authorName}
          </p>
          <p className="text-muted text-sm mt-0.5">{review.date}</p>
        </div>
      </div>
      <StarPill rating={review.rating} />
    </div>

    <div className="h-px bg-border-soft my-4" />

    <p className="text-secondary text-[15px] leading-relaxed">{review.text}</p>

    {/* Действия врача */}
    <div className="flex items-center gap-5 mt-4">
      <button
        onClick={() => onReply(review)}
        className="flex items-center gap-1.5 text-sm text-primary font-medium hover:opacity-80 transition-opacity"
      >
        <ChatIcon className="size-4" />
        {review.reply ? "Изменить ответ" : "Ответить"}
      </button>
      <button
        onClick={() => onComplain(review)}
        className="text-muted text-sm hover:text-primary transition-colors"
      >
        Пожаловаться
      </button>
    </div>

    {/* Ответ врача */}
    {review.reply && (
      <div className="mt-4">
        <p className="text-foreground font-medium text-sm mb-2">Ответ врача</p>
        <div className="rounded-2xl bg-surface p-4">
          <p className="text-secondary text-sm leading-relaxed">
            {review.reply}
          </p>
          {review.replyTime && (
            <p className="text-muted text-xs mt-2">{review.replyTime}</p>
          )}
        </div>
      </div>
    )}
  </div>
);

export const DoctorReviewsPage: FC = () => {
  const { profile } = useDoctorCabinet();
  const queryClient = useQueryClient();
  const [replyTarget, setReplyTarget] = useState<DoctorReview | null>(null);
  const [complaintTarget, setComplaintTarget] = useState<DoctorReview | null>(
    null,
  );

  // Кабинетный эндпоинт отдаёт отзывы на текущего врача без необходимости
  // знать его id (в /api/doctor/profile/ id вообще нет).
  const { data: reviewsData, isLoading } = useQuery({
    queryKey: doctorCabinetKeys.reviews(),
    queryFn: getDoctorReviews,
  });

  const reviews: DoctorReview[] = (reviewsData?.data ?? []).map((r) => {
    const name = resolveAuthorName(r.author);
    return {
      id: String(r.id),
      authorName: name,
      authorInitial: name.charAt(0).toUpperCase(),
      rating: r.rating,
      date: fmtReviewDate(r.created_at),
      text: r.text,
      reply: r.reply?.text,
      replyTime: r.reply ? fmtReviewDate(r.reply.created_at) : undefined,
    };
  });

  const replyMutation = useMutation({
    mutationFn: (vars: { id: number; text: string }) =>
      replyToReview(vars.id, { text: vars.text }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: doctorCabinetKeys.reviews() });
      toast.success("Ответ отправлен");
    },
    onError: (err: unknown) => {
      const data = (err as { response?: { data?: unknown } })?.response?.data;
      toast.error(extractErrorMessage(data, "Не удалось отправить ответ"));
    },
  });

  return (
    <>
      <DoctorPageLayout title="Отзывы">
        <h2 className="text-[32px] font-semibold text-foreground mb-6 hidden lg:block">
          Отзывы
        </h2>

        {/* Статистика — те же плитки, что в виджете отзывов на деталях */}
        <div className="grid grid-cols-2 gap-4 mb-4 max-w-xl">
          <div className="bg-white border border-border-soft rounded-2xl p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="bg-[#FFA18D] rounded-xl size-11 flex items-center justify-center shrink-0">
                <StarIcon className="size-5 text-white" />
              </div>
              <span className="text-[28px] font-semibold text-foreground">
                {profile?.rating ?? "—"}
              </span>
            </div>
            <span className="text-muted block mt-3">Средняя оценка</span>
          </div>

          <div className="bg-white border border-border-soft rounded-2xl p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="bg-[#FFA18D] rounded-xl size-11 flex items-center justify-center shrink-0">
                <ChatIcon className="size-5 text-white" />
              </div>
              <span className="text-[28px] font-semibold text-foreground">
                {profile?.totalReviews ?? "—"}
              </span>
            </div>
            <span className="text-muted block mt-3">Всего отзывов</span>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-[20px] border border-border-soft p-10 text-center text-muted text-sm">
            Загрузка...
          </div>
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-[20px] border border-border-soft p-10 text-center text-muted text-sm">
            Отзывов пока нет
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {reviews.map((r) => (
              <ReviewCard
                key={r.id}
                review={r}
                onReply={setReplyTarget}
                onComplain={setComplaintTarget}
              />
            ))}
          </div>
        )}
      </DoctorPageLayout>

      <ReplyModal
        isOpen={!!replyTarget}
        onClose={() => setReplyTarget(null)}
        reviewAuthor={replyTarget?.authorName ?? ""}
        initialText={replyTarget?.reply ?? ""}
        onSubmit={(text) => {
          if (replyTarget) {
            replyMutation.mutate({ id: Number(replyTarget.id), text });
          }
          setReplyTarget(null);
        }}
      />
      <ComplaintModal
        isOpen={!!complaintTarget}
        onClose={() => setComplaintTarget(null)}
      />
    </>
  );
};
