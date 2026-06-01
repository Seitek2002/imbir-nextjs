export type ReviewTargetType = "doctor" | "clinic" | "service";

// Backend returns author as object despite Swagger saying string
export type ReviewAuthor = { id: number; full_name: string } | string;

export type ReviewItem = {
  id: number;
  author: ReviewAuthor;
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
