"use client";

import { FC, useCallback, useEffect, useRef, useState } from "react";
import { useClickAway } from "react-use";

import { useRouter } from "next/navigation";

import { SearchIcon } from "@/shared/assets/icons";
import { ROUTES } from "@/shared/config";
import { useSearchHistoryStore } from "@/shared/store";
import { IconBtn } from "@/shared/ui";
import { SearchInput } from "@/shared/ui";

import { CategoriesGrid } from "./categories-grid";
import { RecentSearches } from "./recent-searches";
import { SearchSuggestions } from "./suggestions";

const DURATION = 200;
const DEBOUNCE_MS = 300;
// Меньше двух символов — подсказки почти всегда бесполезны, а бэку смысла
// дёргать эндпоинт нет.
const MIN_QUERY_LENGTH = 2;

export const GlobalSearch: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const addSearch = useSearchHistoryStore((state) => state.addSearch);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      setIsOpen(false);
      setQuery("");
    }, DURATION);
  }, []);

  useClickAway(ref, () => {
    if (isOpen && !isClosing) handleClose();
  });

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Подсказки дёргаем не на каждое нажатие клавиши, а после паузы в вводе —
  // иначе при быстром наборе улетает запрос на каждый символ.
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query), DEBOUNCE_MS);
    return () => clearTimeout(timeout);
  }, [query]);

  const handleSearchSubmit = () => {
    if (!query.trim()) return;
    addSearch(query);
    router.push(ROUTES.SEARCH({ query }));
    handleClose();
  };

  const visible = isOpen || isClosing;
  const state = isClosing ? "closed" : "open";

  return (
    <>
      <IconBtn variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        <SearchIcon className="size-5" />
      </IconBtn>

      {visible && (
        <div
          className="modal-overlay fixed inset-0 z-50 flex justify-center items-start pt-[15vh] bg-overlay/40 backdrop-blur-[2px]"
          data-state={state}
        >
          <div
            ref={ref}
            className="search-panel w-full max-w-150 mx-4 overflow-hidden"
            data-state={state}
          >
            <div className="py-4">
              <SearchInput
                placeholder="Поиск клиники, специалиста, услуги"
                value={query}
                onChange={setQuery}
                onEnter={handleSearchSubmit}
              />
            </div>

            <div className="max-h-[60vh] overflow-y-auto scrollbar-hide bg-white rounded-3xl shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
              {query.trim() ? (
                <div className="py-2">
                  {debouncedQuery.trim().length >= MIN_QUERY_LENGTH && (
                    <SearchSuggestions
                      query={debouncedQuery.trim()}
                      onNavigate={handleClose}
                    />
                  )}

                  <button
                    onClick={handleSearchSubmit}
                    className="w-full text-left px-4 py-3 text-primary text-sm font-medium hover:underline"
                  >
                    Все результаты по запросу «{query.trim()}»
                  </button>
                </div>
              ) : (
                <>
                  <RecentSearches />
                  <CategoriesGrid onItemClick={handleClose} />
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
