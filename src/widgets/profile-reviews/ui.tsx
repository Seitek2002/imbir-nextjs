"use client";

import { FC, useState } from "react";

import { UserReviewCard } from "@/entities/user-review";
import type { ReviewType, UserReview } from "@/entities/user-review";

type Props = {
  reviews: UserReview[];
  activeTab: ReviewType;
};

export const ProfileReviews: FC<Props> = ({ reviews, activeTab }) => {
  const [reviewsList, setReviewsList] = useState(reviews);

  const filteredReviews = reviewsList.filter(
    (review) => review.type === activeTab,
  );

  const handleEdit = (id: string) => {
    console.log("Edit review:", id);
  };

  const handleDelete = (id: string) => {
    console.log("Delete review:", id);
    setReviewsList((prev) => prev.filter((review) => review.id !== id));
  };

  if (filteredReviews.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-10 text-center">
        <p className="text-[#838A8D] text-lg">Отзывов пока нет</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {filteredReviews.map((review) => (
        <UserReviewCard
          key={review.id}
          review={review}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
};
