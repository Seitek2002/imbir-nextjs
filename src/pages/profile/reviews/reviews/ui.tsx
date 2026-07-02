"use client";

import { FC, useState } from "react";
import toast from "react-hot-toast";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { ReviewModal } from "@/features/review-modal";

import { deleteReview, profileKeys, updateReview } from "@/shared/api";
import { RemoveIcon } from "@/shared/assets/icons";
import { extractErrorMessage } from "@/shared/lib/errors";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";

import type { ReviewType, UserReview } from "./user-review/model";
import { UserReviewCard } from "./user-review/ui";

type Props = {
  reviews: UserReview[];
  activeTab: ReviewType;
};

export const ProfileReviews: FC<Props> = ({ reviews, activeTab }) => {
  const queryClient = useQueryClient();
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<UserReview | null>(null);

  const filteredReviews = reviews.filter((review) => review.type === activeTab);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: profileKeys.reviews() });

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

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget);
    setDeleteTarget(null);
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
        {filteredReviews.map((review) => (
          <UserReviewCard
            key={review.id}
            review={review}
            onEdit={() => setEditTarget(review)}
            onDelete={() => setDeleteTarget(review.id)}
          />
        ))}
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        icon={<RemoveIcon className="w-7 h-7 [&_path]:stroke-primary" />}
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
