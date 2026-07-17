import { apiClient } from "../client";
import { SearchSuggestResponse } from "./types";

export const getSearchSuggestions = async (
  query: string,
): Promise<SearchSuggestResponse> => {
  const { data } = await apiClient.get<SearchSuggestResponse>(
    "/api/search/suggest/",
    { params: { q: query } },
  );
  return data;
};
