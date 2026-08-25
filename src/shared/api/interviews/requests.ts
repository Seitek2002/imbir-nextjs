import { apiClient } from "../client";
import { PaginatedResponse } from "../types";
import { PublicInterview } from "./types";

// Эндпоинт не умеет фильтровать по врачу — только page/page_size.
export const getInterviews = async (
  params: { page_size?: number } = {},
): Promise<PaginatedResponse<PublicInterview>> => {
  const { data } = await apiClient.get<PaginatedResponse<PublicInterview>>(
    "/api/interviews/",
    { params },
  );
  return data;
};
