"use client";

import toast from "react-hot-toast";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  type ReviewTargetType,
  clinicKeys,
  createReview,
  deleteReview,
  doctorKeys,
  getMyReviews,
  profileKeys,
  reviewKeys,
  serviceKeys,
} from "@/shared/api";
import { extractErrorMessage } from "@/shared/lib/errors";
import { useInvalidateUserStatus } from "@/shared/lib/useReference";
import { useAuthStore } from "@/shared/store";

// Сама карточка цели: в ней живёт rating, который бэк пересчитывает сам
// (reviews/serializers.py: _update_rating). Сбрасываем весь префикс all, а не
// точечный detail(id): так обновится и каталог, где рейтинг тоже показан,
// и невозможно промахнуться типом id.
const TARGET_KEYS: Record<ReviewTargetType, readonly string[]> = {
  clinic: clinicKeys.all,
  doctor: doctorKeys.all,
  service: serviceKeys.all,
};

/**
 * Сброс кэша после нового отзыва. Один отзыв меняет четыре вещи сразу:
 *
 *   1. список отзывов на странице врача/клиники;
 *   2. среднюю оценку — она лежит в карточке цели, а не в списке отзывов;
 *   3. раздел «Мои отзывы»;
 *   4. проценты заполненности статуса.
 *
 * Раньше это было скопировано по трём файлам и везде без пункта 2:
 * число отзывов на экране росло, а средняя оценка оставалась старой
 * до перезагрузки страницы.
 *
 * Отдельно от useSubmitReview, потому что отзыв после приёма
 * (pages/profile/history) отправляется со своими полями и своими побочными
 * эффектами — общая у него только эта часть.
 */
export const useInvalidateAfterReview = () => {
  const queryClient = useQueryClient();
  const invalidateUserStatus = useInvalidateUserStatus();

  return (targetType: ReviewTargetType, targetId: number | string) => {
    queryClient.invalidateQueries({
      queryKey: reviewKeys.byTarget(targetType, targetId),
    });
    queryClient.invalidateQueries({ queryKey: TARGET_KEYS[targetType] });
    queryClient.invalidateQueries({ queryKey: profileKeys.reviews() });
    invalidateUserStatus();
  };
};

/**
 * Отправка отзыва со страницы врача или клиники.
 *
 * Обе страницы делали это одинаково — различалась ровно одна строка
 * (`target_type`), включая тексты тостов и комментарий про сброс кэша.
 *
 * submitReview специально принимает (rating, text): это ровно та сигнатура,
 * которую ждёт onSubmitReview у ReviewsSection, поэтому на странице не нужен
 * промежуточный колбэк.
 */
export const useSubmitReview = (
  targetType: ReviewTargetType,
  targetId: number | string,
) => {
  const invalidateAfterReview = useInvalidateAfterReview();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: (vars: { rating: number; text: string }) =>
      createReview({
        target_type: targetType,
        target_id: Number(targetId),
        rating: vars.rating,
        text: vars.text,
      }),
    onSuccess: () => {
      invalidateAfterReview(targetType, targetId);
      toast.success("Спасибо за отзыв!");
    },
    onError: (err: unknown) => {
      const data = (err as { response?: { data?: unknown } })?.response?.data;
      toast.error(extractErrorMessage(data, "Не удалось отправить отзыв"));
    },
  });

  return {
    isSubmitting: isPending,
    submitReview: (rating: number, text: string) =>
      mutateAsync({ rating, text }),
  };
};

/**
 * Удаление своего отзыва со страницы врача или клиники.
 *
 * Чужой отзыв удалить нельзя и через API: DELETE /api/reviews/{id}/ требует
 * IsAuthor (reviews/views.py:78). Проверка в интерфейсе нужна только чтобы не
 * показывать кнопку, которая всё равно вернёт 403.
 *
 * Сброс кэша тот же, что после создания: бэк при удалении точно так же
 * пересчитывает rating и reviews_count (reviews/views.py: perform_destroy).
 */
export const useDeleteReview = (
  targetType: ReviewTargetType,
  targetId: number | string,
) => {
  const invalidateAfterReview = useInvalidateAfterReview();

  const { isPending, mutateAsync } = useMutation({
    mutationFn: (reviewId: number) => deleteReview(reviewId),
    onSuccess: () => {
      invalidateAfterReview(targetType, targetId);
      toast.success("Отзыв удалён");
    },
    onError: (err: unknown) => {
      const data = (err as { response?: { data?: unknown } })?.response?.data;
      toast.error(extractErrorMessage(data, "Не удалось удалить отзыв"));
    },
  });

  return { isDeleting: isPending, removeReview: mutateAsync };
};

/**
 * Оставлял ли текущий пользователь отзыв на эту цель.
 *
 * Спрашиваем отдельно, а не ищем в загруженном списке: на карточке врача
 * видна только первая страница отзывов, и свой мог туда не попасть.
 *
 * Бэк теперь отклоняет второй отзыв («Вы уже оставили отзыв этому врачу»),
 * поэтому без этой проверки человек напишет текст и только потом узнает, что
 * отправить его нельзя.
 */
export const useHasMyReview = (
  targetType: ReviewTargetType,
  targetId: number | string,
): boolean => {
  const isAuthed = useAuthStore((state) => Boolean(state.accessToken));

  const { data } = useQuery({
    queryKey: profileKeys.reviews(),
    queryFn: getMyReviews,
    enabled: isAuthed,
  });

  return Boolean(
    data?.data.some(
      (review) =>
        review.target_type === targetType &&
        typeof review.target === "object" &&
        review.target !== null &&
        String(review.target.id) === String(targetId),
    ),
  );
};
