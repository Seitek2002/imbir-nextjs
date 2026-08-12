export type ReviewTargetType = "doctor" | "clinic" | "service";

// Backend returns author/target as objects despite Swagger typing them string.
// avatar_url приходит относительным ("/media/users/avatars/xxx.webp") и только
// если фото загружено — у авторов без аватара поля просто нет.
// Абсолютный адрес собирает toMediaUrl (shared/lib/media.ts).
export type ReviewParty = {
  id: number;
  full_name: string;
  avatar_url?: string | null;
};
export type ReviewAuthor = ReviewParty | string;

// Ответ на отзыв от врача/клиники. null, если ответа ещё нет.
export type ReviewReply = {
  text: string;
  created_at: string;
} | null;

export type ReviewItem = {
  id: number;
  author?: ReviewAuthor;
  // /api/profile/reviews/ отдаёт target (на кого отзыв) вместо author.
  target?: ReviewParty;
  target_type: ReviewTargetType;
  target_id?: number;
  appointment_id?: number | null;
  rating: number;
  text: string;
  reply?: ReviewReply;
  created_at: string;
};

export type PaginatedReviewsResponse = {
  data: ReviewItem[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
};

// POST /api/reviews/ — target_id обязателен в теле (не query-параметр).
// appointment_id опционален: привязывает отзыв к завершённому приёму.
export type CreateReviewRequest = {
  target_type: ReviewTargetType;
  target_id: number;
  appointment_id?: number;
  rating: number;
  text?: string;
};

// PUT /api/reviews/{id}/ — можно менять только оценку и текст.
export type UpdateReviewRequest = {
  rating: number;
  text?: string;
};

export type ReplyReviewRequest = {
  text: string;
};
