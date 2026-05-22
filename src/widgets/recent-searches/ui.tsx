"use client";

import { FC, useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { ConfirmDialog, IconBtn } from "@/shared";

import { SearchHistory, SearchRemoveHistory } from "@/shared/assets";
import { ROUTES } from "@/shared/config/routes";
import { useSearchHistoryStore } from "@/shared/store/useSearchHistoryStore";

const TrashIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#F5653E"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
  </svg>
);

export const RecentSearches: FC = () => {
  const router = useRouter();
  const { history, removeSearch, clearHistory } = useSearchHistoryStore();

  const [mounted, setMounted] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearch = (query: string) => router.push(ROUTES.SEARCH({ query }));

  if (!mounted || history.length === 0) return null;

  return (
    <>
      <div className="bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[#191A1B] text-lg font-medium">Недавно искали</h2>
          <button
            onClick={() => setConfirmOpen(true)}
            className="text-[#F5653E] text-base active:scale-95 transition-transform hover:opacity-80"
          >
            Удалить все
          </button>
        </div>

        <ul className="flex flex-col gap-4">
          {history.map((item) => (
            <li key={item} className="flex items-center justify-between group">
              <button
                onClick={() => handleSearch(item)}
                className="flex items-center gap-3 flex-1 text-left hover:opacity-70 transition-opacity"
              >
                <SearchHistory className="size-5 text-[#838A8D] shrink-0" />
                <span className="text-[#191A1B] text-base truncate">
                  {item}
                </span>
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

      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={clearHistory}
        icon={<TrashIcon />}
        title="Удалить историю поиска?"
        description="История будет удалена без возможности восстановления"
        confirmLabel="Удалить"
        cancelLabel="Отмена"
      />
    </>
  );
};
