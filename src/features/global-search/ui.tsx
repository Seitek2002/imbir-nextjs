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

const DURATION = 200;

export const GlobalSearch: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [query, setQuery] = useState("");
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
              {query ? (
                <div className="p-4">
                  <p className="text-foreground text-sm mb-4">
                    Ищем: <span className="font-medium">{query}</span>...
                  </p>

                  <button
                    onClick={handleSearchSubmit}
                    className="text-primary text-sm font-medium hover:underline"
                  >
                    Все результаты по запросу «{query}»
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
