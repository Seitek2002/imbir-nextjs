export type ReviewTargetType = "clinic" | "doctor" | "service";

// Backend returns author/target as objects despite Swagger typing them string.
// avatar_url приходит относительным ("/media/users/avatars/xxx.webp") и только
// если фото загружено — у авторов без аватара поля просто нет.
// Абсолютный адрес собирает toMediaUrl (shared/lib/media.ts).
export type ReviewParty = {
  avatar_url?: null | string;
  full_name: string;
  id: number;
};
export type ReviewAuthor = ReviewParty | string;

// target — «на кого» отзыв (см. ниже) — бывает не только человеком (врач:
// full_name), но и клиникой (name) — проверено живым запросом на
// /api/profile/reviews/: {"id":271,"name":"Тестовая Клиника"} для клиники
// против {"id":270,"full_name":"..."} для врача. Раньше код читал только
// full_name, из-за чего название клиники в отзывах не отображалось.
export type ReviewTarget = {
  avatar_url?: null | string;
  full_name?: string;
  id: number;
  name?: string;
};

export type ReviewTargetValue = ReviewTarget | string;

// Ответ на отзыв от врача/клиники. null, если ответа ещё нет.
export type ReviewReply = {
  created_at: string;
  text: string;
} | null;

export type ReviewItem = {
  appointment_id?: null | number;
  author?: ReviewAuthor;
  created_at: string;
  id: number;
  rating: number;
  reply?: ReviewReply;
  // /api/profile/reviews/ отдаёт target (на кого отзыв) вместо author.
  target?: ReviewTargetValue;
  target_id?: number;
  target_type: ReviewTargetType;
  text: string;
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
  appointment_id?: number;
  rating: number;
  target_id: number;
  target_type: ReviewTargetType;
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
