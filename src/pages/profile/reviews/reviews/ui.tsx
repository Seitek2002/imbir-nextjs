"use client";

import { FC, useState } from "react";
import toast from "react-hot-toast";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ReviewModal } from "@/features/review-modal";

import { deleteReview, profileKeys, updateReview } from "@/shared/api";
import { RemoveIcon } from "@/shared/assets/icons";
import { extractErrorMessage } from "@/shared/lib/errors";
import { useInvalidateUserStatus } from "@/shared/lib/useReference";
import { Button } from "@/shared/ui";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";

import type { ReviewType, UserReview } from "./user-review/model";
import { UserReviewCard } from "./user-review/ui";

type Props = {
  activeTab: ReviewType;
  reviews: UserReview[];
};

// Сколько отзывов видно сразу и на сколько прирастает список по кнопке.
// Раньше все отзывы выводились одним длинным столбцом.
const PAGE_SIZE = 2;

export const ProfileReviews: FC<Props> = ({ reviews, activeTab }) => {
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<null | string>(null);
  const [editTarget, setEditTarget] = useState<null | UserReview>(null);

  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [countedTab, setCountedTab] = useState(activeTab);

  const filteredReviews = reviews.filter((review) => review.type === activeTab);

  // Смена вкладки сворачивает список обратно к первым двум. Правим состояние
  // во время рендера, а не в эффекте: так принято в проекте (эффект здесь
  // запрещён правилом react-hooks/set-state-in-effect).
  if (countedTab !== activeTab) {
    setCountedTab(activeTab);
    setVisibleCount(PAGE_SIZE);
  }

  const visibleReviews = filteredReviews.slice(0, visibleCount);
  const hiddenCount = filteredReviews.length - visibleReviews.length;

  const invalidateUserStatus = useInvalidateUserStatus();

  // Вместе со списком сбрасываем и статус пользователя: его проценты сервер
  // считает по средней оценке отзывов, и без этого они менялись только после
  // перезагрузки страницы.
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: profileKeys.reviews() });
    invalidateUserStatus();
  };

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteReview(Number(id)),
    onSuccess: () => {
      invalidate();
      toast.success("Отзыв удалён");
    },
    onError: (err: unknown) => {
      const data = (err as { response?: { data?: unknown } })?.response?.data;
      toast.error(extractErrorMessage(data, "Не удалось удалить отзыв"));
    },
  });

  const updateMutation = useMutation({
    mutationFn: (vars: { id: string; rating: number; text: string }) =>
      updateReview(Number(vars.id), { rating: vars.rating, text: vars.text }),
    onSuccess: () => {
      invalidate();
      toast.success("Отзыв обновлён");
    },
    onError: (err: unknown) => {
      const data = (err as { response?: { data?: unknown } })?.response?.data;
      toast.error(extractErrorMessage(data, "Не удалось обновить отзыв"));
    },
  });

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget);
      setDeleteTarget(null);
    } catch {
      // ошибка уже обработана в onError мутации (toast)
    }
  };

  const getEditData = (review: UserReview) => {
    switch (review.type) {
      case "clinic":
        return { name: review.clinicName ?? "", specialty: "", clinic: "" };
      case "doctor":
        return {
          name: review.doctorName ?? "",
          specialty: review.doctorSpecialty ?? "",
          clinic: review.doctorClinic ?? "",
        };
      case "service":
        return {
          name: review.serviceName ?? "",
          specialty: review.serviceCategory ?? "",
          clinic: review.serviceClinic ?? "",
        };
      default:
        return { name: "", specialty: "", clinic: "" };
    }
  };

  if (filteredReviews.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-10 text-center">
        <p className="text-muted text-lg">Отзывов пока нет</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {visibleReviews.map((review) => (
          <UserReviewCard
            key={review.id}
            review={review}
            onEdit={() => setEditTarget(review)}
            onDelete={() => setDeleteTarget(review.id)}
          />
        ))}
      </div>

      {hiddenCount > 0 && (
        <div className="flex justify-center mt-4">
          <Button
            variant="outline"
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
          >
            Показать ещё
          </Button>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
        closeOnConfirm={false}
        icon={<RemoveIcon className="w-7 h-7 [&_path]:stroke-red-500" />}
        variant="danger"
        title="Удалить отзыв?"
        description="Отзыв будет удалён без возможности восстановления"
        confirmLabel="Удалить"
        cancelLabel="Назад"
      />

      {editTarget &&
        (() => {
          const data = getEditData(editTarget);
          return (
            <ReviewModal
              key={editTarget.id}
              isOpen={!!editTarget}
              onClose={() => setEditTarget(null)}
              doctorName={data.name}
              doctorSpecialty={data.specialty}
              doctorClinic={data.clinic}
              doctorImage={editTarget.image}
              title="Редактировать отзыв"
              initialRating={editTarget.rating}
              initialComment={editTarget.comment}
              onSubmit={(rating, comment) => {
                updateMutation.mutate({
                  id: editTarget.id,
                  rating,
                  text: comment,
                });
                setEditTarget(null);
              }}
            />
          );
        })()}
    </>
  );
};
