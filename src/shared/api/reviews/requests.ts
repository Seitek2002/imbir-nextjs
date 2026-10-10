import { apiClient } from "../client";
import { fetchAllPages } from "../doctor-cabinet/requests";
import { PaginatedResponse } from "../types";
import {
  CreateReviewRequest,
  ReplyReviewRequest,
  ReviewComplaintRequest,
  ReviewItem,
  ReviewTargetType,
  UpdateReviewRequest,
} from "./types";

// GET /api/reviews/?target_type=doctor&target_id=1
export const getReviews = async (
  targetType: ReviewTargetType,
  targetId: number | string,
  // Сервер отдаёт по 20 штук (StandardPagination). Блок отзывов на странице
  // врача берёт первую страницу и не передаёт ничего, отдельная страница всех
  // отзывов листает.
  params?: { page?: number; page_size?: number },
): Promise<PaginatedResponse<ReviewItem>> => {
  const { data } = await apiClient.get<PaginatedResponse<ReviewItem>>(
    "/api/reviews/",
    { params: { target_type: targetType, target_id: targetId, ...params } },
  );
  return data;
};

// Отзывы, оставленные текущим пациентом (в ответе target вместо author).
// getDoctorReviews / getClinicReviews (кабинеты) живут в doctor-cabinet /
// clinic-cabinet requests — тут не дублируем.
// Весь список, а не первые 20 (см. fetchAllPages).
export const getMyReviews = (): Promise<PaginatedResponse<ReviewItem>> =>
  fetchAllPages<ReviewItem>("/api/profile/reviews/");

// Свои отзывы на одну цель — для проверки «уже оставлял». Бэк фильтрует по
// target_type/target_id (id пользователя врача/клиники); старый бэк параметры
// игнорирует и отдаёт первую страницу всех отзывов — поэтому вызывающий
// всё равно сверяет цель сам.
export const getMyReviewsForTarget = async (
  targetType: ReviewTargetType,
  targetId: number | string,
): Promise<PaginatedResponse<ReviewItem>> => {
  const { data } = await apiClient.get<PaginatedResponse<ReviewItem>>(
    "/api/profile/reviews/",
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

// Жалоба врача/клиники на отзыв о себе. Бэк пересылает её администратору
// письмом; если отправить не удалось — отвечает ошибкой, а не «принято».
export const complainAboutReview = async (
  id: number,
  body: ReviewComplaintRequest,
): Promise<void> => {
  await apiClient.post(`/api/reviews/${id}/complaint/`, body);
};
