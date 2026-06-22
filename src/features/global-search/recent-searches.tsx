"use client";

import { FC, useState } from "react";

import { useRouter } from "next/navigation";

import { ConfirmDialog, IconBtn } from "@/shared";

import { SearchHistory, SearchRemoveHistory, TrashIcon } from "@/shared/assets";
import { ROUTES } from "@/shared/config/routes";
import { useMounted } from "@/shared/lib/useMounted";
import { useSearchHistoryStore } from "@/shared/store/useSearchHistoryStore";

export const RecentSearches: FC = () => {
  const router = useRouter();
  const { history, removeSearch, clearHistory } = useSearchHistoryStore();

  const mounted = useMounted();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleSearch = (query: string) => router.push(ROUTES.SEARCH({ query }));

  if (!mounted || history.length === 0) return null;

  return (
    <>
      <div className="bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-foreground text-lg font-medium">
            Недавно искали
          </h2>
          <button
            onClick={() => setConfirmOpen(true)}
            className="text-primary text-base active:scale-95 transition-transform hover:opacity-80"
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
                <SearchHistory className="size-5 text-muted shrink-0" />
                <span className="text-foreground text-base truncate">
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
        icon={<TrashIcon className="w-7 h-7 text-primary" />}
        title="Удалить историю поиска?"
        description="История будет удалена без возможности восстановления"
        confirmLabel="Удалить"
        cancelLabel="Отмена"
      />
    </>
  );
};
