export type ReviewTargetType = "doctor" | "clinic" | "service";

export type ReviewItem = {
  id: number;
  author: string;
  target_type: ReviewTargetType;
  rating: number;
  text: string;
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

// target_id is passed as a query param (GET), not in the body (POST)
export type CreateReviewRequest = {
  target_type: ReviewTargetType;
  rating: number;
  text?: string;
};
