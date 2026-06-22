"use client";

import { FC, useState } from "react";

import { ReviewModal } from "@/features/review-modal";

import { UserReviewCard } from "@/entities/user-review";
import type { ReviewType, UserReview } from "@/entities/user-review";

import { RemoveIcon } from "@/shared/assets";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";

type Props = {
  reviews: UserReview[];
  activeTab: ReviewType;
};

export const ProfileReviews: FC<Props> = ({ reviews, activeTab }) => {
  const [reviewsList, setReviewsList] = useState(reviews);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [editTarget, setEditTarget] = useState<UserReview | null>(null);

  const filteredReviews = reviewsList.filter(
    (review) => review.type === activeTab,
  );

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    setReviewsList((prev) => prev.filter((r) => r.id !== deleteTarget));
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
              onSubmit={(rating, comment) => {
                setReviewsList((prev) =>
                  prev.map((r) =>
                    r.id === editTarget.id ? { ...r, rating, comment } : r,
                  ),
                );
                setEditTarget(null);
              }}
            />
          );
        })()}
    </>
  );
};
