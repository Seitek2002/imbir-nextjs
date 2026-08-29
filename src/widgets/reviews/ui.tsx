"use client";

import { FC, useMemo, useState } from "react";
import toast from "react-hot-toast";

import Link from "next/link";

import { ReviewModal } from "@/features/review-modal";

import { ChatIcon, StarIcon, TrashIcon } from "@/shared/assets/icons";
import { cn } from "@/shared/lib/utils";
import { useAuthStore } from "@/shared/store";
import { AnimatedNumber, Button } from "@/shared/ui";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";

import { ReviewCard } from "./ReviewCard";

// Отзывов ещё нет. Без этого правая колонка оставалась пустой, и рядом с
// заполненной левой это читалось как не догрузившийся блок. Виджет общий для
// врача и клиники, поэтому текст без упоминания того и другого.
const EmptyReviews: FC = () => (
  <div className="h-full min-h-70 bg-white md:bg-transparent border border-border-soft border-dashed rounded-2xl flex flex-col items-center justify-center text-center px-6 py-12 gap-3">
    <div className="size-14 rounded-2xl bg-[#FFF0EE] flex items-center justify-center">
      <ChatIcon className="size-6 text-primary" />
    </div>
    <p className="text-foreground font-medium text-base">Отзывов пока нет</p>
    <p className="text-muted text-sm max-w-70">
      Здесь появятся отзывы после приёма. Оставьте первый — он поможет другим
      пациентам с выбором.
    </p>
  </div>
);

// Тип для отдельного отзыва
export type ReviewItem = {
  author: string;
  // id автора — по нему понимаем, что отзыв свой.
  authorId?: number;
  avatarUrl?: string;
  date: string;
  id: number | string;
  rating: number;
  reply?: { date: string; text: string } | null;
  text: string;
};

type Props = {
  // Адрес страницы со всеми отзывами. Здесь видна только первая страница
  // (сервер отдаёт по 20), остальное — там.
  allReviewsHref?: string;
  // Пользователь уже писал отзыв на эту цель — форму не показываем. Бэк
  // второй отзыв отклонит, и без этого человек узнавал бы об этом уже после
  // того, как написал текст.
  alreadyReviewed?: boolean;
  averageRating: number;
  doctorClinic?: string;
  doctorImage?: string;
  doctorName?: string;
  doctorSpecialty?: string;
  initialReviews: ReviewItem[];
  isSubmitting?: boolean;
  // Удаление своего отзыва. Не передано — кнопки нет ни у кого.
  onDeleteReview?: (reviewId: number) => Promise<unknown> | void;
  // Отправка отзыва на бэк. Не передана — значит гость: кнопка «Оставить
  // свой отзыв» остаётся видна, но по клику вместо модалки просит войти.
  // Может вернуть промис — тогда форма очистится только после успеха.
  onSubmitReview?: (rating: number, text: string) => Promise<unknown> | void;
};

export const ReviewsSection: FC<Props> = ({
  initialReviews,
  averageRating,
  onSubmitReview,
  onDeleteReview,
  allReviewsHref,
  alreadyReviewed = false,
  isSubmitting,
  doctorName = "Специалист",
  doctorSpecialty = "",
  doctorClinic = "",
  doctorImage,
}) => {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(0);

  // Свой отзыв определяем по id пользователя, а не по имени: тёзки реальны,
  // и показать чужую кнопку удаления было бы хуже, чем не показать свою.
  const currentUserId = useAuthStore((state) => state.user?.id);

  // Свой отзыв — первым. Сортируем здесь, а не на бэке: /api/reviews/ отдаётся
  // и анонимам, и порядок, зависящий от того, кто спрашивает, сделал бы ответ
  // некэшируемым ради одной записи. Остальные остаются в порядке сервера
  // (новые сверху).
  //
  // Ограничение: сервер отдаёт по 20 отзывов, и мы грузим только первую
  // страницу. Если у врача отзывов больше и свой оказался на второй,
  // поднять его отсюда нечем — его просто нет в данных.
  const reviews = useMemo(() => {
    if (currentUserId === undefined) return initialReviews;

    const mine = initialReviews.filter((r) => r.authorId === currentUserId);
    if (mine.length === 0) return initialReviews;

    return [
      ...mine,
      ...initialReviews.filter((r) => r.authorId !== currentUserId),
    ];
  }, [initialReviews, currentUserId]);
  const [pendingDeleteId, setPendingDeleteId] = useState<null | number>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (pendingDeleteId === null || !onDeleteReview) return;
    setIsDeleting(true);
    try {
      await onDeleteReview(pendingDeleteId);
      setPendingDeleteId(null);
    } catch {
      // Сообщение показывает onError мутации; модалку оставляем открытой,
      // чтобы можно было повторить.
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddReview = async () => {
    if (!newReviewText.trim() || newReviewRating === 0 || !onSubmitReview)
      return;

    try {
      await onSubmitReview(newReviewRating, newReviewText);
      // Чистим форму ТОЛЬКО после успеха. Раньше она очищалась сразу после
      // вызова, и при любой ошибке (протухший токен, обрыв сети) написанный
      // отзыв пропадал вместе с оценкой — переписывать приходилось заново.
      setNewReviewText("");
      setNewReviewRating(0);
    } catch {
      // Сообщение показывает вызывающий (onError мутации). Здесь важно только
      // не тронуть форму.
    }
  };

  return (
    <div className="mt-10 md:mt-20 mb-10 md:mb-20 md:px-0 bg-white rounded-[20px] p-4 mx-2">
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <h2 className="text-2xl font-semibold text-foreground">Отзывы</h2>
        {/* Раньше была заглушка href="#" и только на мобильном. Показываем на
            всех ширинах: десктопный пользователь точно так же не видит отзывы
            дальше двадцатого. */}
        {allReviewsHref && reviews.length > 0 && (
          <Link
            href={allReviewsHref}
            className="text-primary text-sm font-medium hover:underline"
          >
            Все
          </Link>
        )}
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
                {/* При нуле отзывов средней оценки не существует: «0.00»
                    читалось как самая низкая оценка. */}
                {reviews.length > 0 ? (
                  <AnimatedNumber
                    value={averageRating}
                    decimals={2}
                    className="text-[24px] font-semibold text-foreground"
                  />
                ) : (
                  <span className="text-[24px] font-semibold text-foreground">
                    —
                  </span>
                )}
              </div>
              <span className="text-muted">Средняя оценка</span>
            </div>

            <div className="flex-1 bg-white md:bg-transparent border border-border-soft rounded-2xl p-6 flex flex-col items-center md:items-start justify-center">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-[#FFA18D] p-2.5 rounded-xl size-10 flex items-center justify-center">
                  <ChatIcon className="size-5 text-white" />
                </div>
                <AnimatedNumber
                  value={reviews.length}
                  className="text-[24px] font-semibold text-foreground"
                />
              </div>
              <span className="text-muted">Всего отзывов</span>
            </div>
          </div>

          {/* Кнопка видна и гостю: молчаливый переход на логин не
              объяснял, зачем он произошёл — теперь гость видит тост с
              причиной и остаётся на странице. */}
          {!alreadyReviewed && (
            <Button
              variant="outline"
              className="md:hidden w-full justify-center bg-white"
              size="sm"
              onClick={() => {
                if (onSubmitReview) setIsReviewModalOpen(true);
                else toast.error("Войдите в аккаунт, чтобы оставить отзыв");
              }}
            >
              Оставить свой отзыв
            </Button>
          )}

          {alreadyReviewed && (
            <div className="hidden md:block bg-white border border-border-soft border-dashed rounded-2xl p-4 text-center">
              <p className="text-foreground font-medium">
                Вы уже оставили отзыв
              </p>
              <p className="text-muted text-sm mt-1">
                Он открывает список. Удалите его, чтобы написать заново.
              </p>
            </div>
          )}

          {/* Форма — только если подключена отправка и отзыва ещё нет */}
          {!alreadyReviewed && onSubmitReview && (
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
        {/* min-w-0: без него flex-элемент не сжимается уже содержимого, и отзыв
            из длинной строки без пробелов растягивал страницу на десятки тысяч
            пикселей — появлялся горизонтальный скролл всего сайта. */}
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          {reviews.length === 0 ? (
            <EmptyReviews />
          ) : (
            reviews.map((review) => (
              <ReviewCard
                key={review.id}
                author={review.author}
                date={review.date}
                text={review.text}
                rating={review.rating}
                avatarUrl={review.avatarUrl}
                reply={review.reply}
                onDelete={
                  onDeleteReview &&
                  currentUserId !== undefined &&
                  review.authorId === currentUserId
                    ? () => setPendingDeleteId(Number(review.id))
                    : undefined
                }
              />
            ))
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={pendingDeleteId !== null}
        onClose={() => setPendingDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        closeOnConfirm={false}
        icon={<TrashIcon className="w-7 h-7 text-primary" />}
        title="Удалить отзыв?"
        description="Отзыв исчезнет со страницы, а средняя оценка пересчитается. Вернуть его нельзя."
        confirmLabel="Удалить"
        cancelLabel="Отмена"
      />

      {onSubmitReview && (
        <ReviewModal
          isOpen={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
          doctorName={doctorName}
          doctorSpecialty={doctorSpecialty}
          doctorClinic={doctorClinic}
          doctorImage={doctorImage}
          onSubmit={onSubmitReview}
        />
      )}
    </div>
  );
};
