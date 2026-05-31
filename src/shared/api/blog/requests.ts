import { apiClient } from "../client";
import { PaginatedResponse } from "../types";
import { BlogCategory, BlogFilters, BlogPost, BlogPostDetail } from "./types";

export const getBlogPosts = async (
  filters: BlogFilters = {},
): Promise<PaginatedResponse<BlogPost>> => {
  const { data } = await apiClient.get<PaginatedResponse<BlogPost>>(
    "/api/blog/",
    { params: filters },
  );
  return data;
};

export const getBlogCategories = async (): Promise<BlogCategory[]> => {
  const { data } = await apiClient.get<BlogCategory[]>("/api/blog/categories/");
  return data;
};

export const getBlogPost = async (slug: string): Promise<BlogPostDetail> => {
  const { data } = await apiClient.get<BlogPostDetail>(`/api/blog/${slug}/`);
  return data;
};
