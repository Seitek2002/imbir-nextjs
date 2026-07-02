import { apiClient } from "../client";
import { PaginatedResponse } from "../types";
import {
  CreateReviewRequest,
  ReplyReviewRequest,
  ReviewItem,
  ReviewTargetType,
  UpdateReviewRequest,
} from "./types";

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

// Отзывы, оставленные текущим пациентом (в ответе target вместо author).
// getDoctorReviews / getClinicReviews (кабинеты) живут в doctor-cabinet /
// clinic-cabinet requests — тут не дублируем.
export const getMyReviews = async (): Promise<
  PaginatedResponse<ReviewItem>
> => {
  const { data } = await apiClient.get<PaginatedResponse<ReviewItem>>(
    "/api/profile/reviews/",
  );
  return data;
};

export const createReview = async (
  body: CreateReviewRequest,
): Promise<ReviewItem> => {
  const { data } = await apiClient.post<ReviewItem>("/api/reviews/", body);
  return data;
};

export const updateReview = async (
  id: number,
  body: UpdateReviewRequest,
): Promise<ReviewItem> => {
  const { data } = await apiClient.put<ReviewItem>(`/api/reviews/${id}/`, body);
  return data;
};

export const deleteReview = async (id: number): Promise<void> => {
  await apiClient.delete(`/api/reviews/${id}/`);
};

// Ответ врача/клиники на отзыв. Повторный вызов заменяет ответ.
export const replyToReview = async (
  id: number,
  body: ReplyReviewRequest,
): Promise<ReviewItem> => {
  const { data } = await apiClient.post<ReviewItem>(
    `/api/reviews/${id}/reply/`,
    body,
  );
  return data;
};
