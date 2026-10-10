import { apiClient } from "../client";
import { SearchSuggestResponse } from "./types";

// city — выбранный пользователем город. Без него бэк подсказывает по всем
// городам (старое поведение).
export const getSearchSuggestions = async (
  query: string,
  city?: string,
): Promise<SearchSuggestResponse> => {
  const { data } = await apiClient.get<SearchSuggestResponse>(
    "/api/search/suggest/",
    { params: { q: query, city: city || undefined } },
  );
  return data;
};
