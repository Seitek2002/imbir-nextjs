import { apiClient } from "../client";
import { PaginatedResponse } from "../types";
import { CreateReviewRequest, ReviewItem, ReviewTargetType } from "./types";

// GET /api/reviews/?target_type=doctor&target_id=1
export const getReviews = async (
  targetType: ReviewTargetType,
  targetId: string | number,
): Promise<PaginatedResponse<ReviewItem>> => {
  const { data } = await apiClient.get<PaginatedResponse<ReviewItem>>(
    "/api/reviews/",
    { params: { target_type: targetType, target_id: targetId } },
  );
  return data;
};

export const createReview = async (
  body: CreateReviewRequest,
): Promise<ReviewItem> => {
  const { data } = await apiClient.post<ReviewItem>("/api/reviews/", body);
  return data;
};
