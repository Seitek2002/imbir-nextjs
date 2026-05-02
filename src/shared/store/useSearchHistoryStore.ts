import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SearchHistoryState {
  history: string[];
  addSearch: (query: string) => void;
  removeSearch: (query: string) => void;
  clearHistory: () => void;
}

export const useSearchHistoryStore = create<SearchHistoryState>()(
  persist(
    (set) => ({
      history: [],
      addSearch: (query) =>
        set((state) => {
          const trimmed = query.trim();
          if (!trimmed) return state;

          const newHistory = [
            trimmed,
            ...state.history.filter((item) => item !== trimmed),
          ].slice(0, 5);
          return { history: newHistory };
        }),
      removeSearch: (query) =>
        set((state) => ({
          history: state.history.filter((item) => item !== query),
        })),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: "search-history-storage", // Имя ключа в LocalStorage
    },
  ),
);
