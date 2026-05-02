"use client";

import { FC, useEffect, useState } from "react";

// <-- Добавили хуки
import { useRouter } from "next/navigation";

import { IconBtn } from "@/shared";

import { SearchHistory, SearchRemoveHistory } from "@/shared/assets";
import { useSearchHistoryStore } from "@/shared/store/useSearchHistoryStore";

export const RecentSearches: FC = () => {
  const router = useRouter();
  const { history, removeSearch, clearHistory } = useSearchHistoryStore();

  // --- НОВОЕ: Защита от Hydration Mismatch в Next.js ---
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  // -----------------------------------------------------

  const handleSearch = (query: string) =>
    router.push(`/search?q=${encodeURIComponent(query)}`);

  if (!mounted || history.length === 0) return null;

  return (
    <div className="bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[#191A1B] text-lg font-medium">Недавно искали</h2>
        <button
          onClick={clearHistory}
          className="text-[#F5653E] text-base active:scale-95 transition-transform hover:opacity-80"
        >
          Удалить все
        </button>
      </div>

      <ul className="flex flex-col gap-4">
        {history.map((item, index) => (
          <li key={index} className="flex items-center justify-between group">
            <button
              onClick={() => handleSearch(item)}
              className="flex items-center gap-3 flex-1 text-left hover:opacity-70 transition-opacity"
            >
              <SearchHistory className="size-5 text-[#838A8D] shrink-0" />
              <span className="text-[#191A1B] text-base truncate">{item}</span>
            </button>

            <IconBtn
              variant="outline"
              className="shrink-0 ml-2"
              onClick={() => removeSearch(item)}
            >
              <SearchRemoveHistory className="size-3" />
            </IconBtn>
          </li>
        ))}
      </ul>
    </div>
  );
};
