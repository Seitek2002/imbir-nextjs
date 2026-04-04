"use client";

import { FC, useEffect, useRef, useState } from "react";
import { useClickAway } from "react-use";

import { useRouter } from "next/navigation";

import { IconBtn } from "@/shared";
import { CategoriesGrid, RecentSearches } from "@/widgets";

import { SearchIcon } from "@/shared/assets";
import { SearchInput } from "@/shared/ui";

export const GlobalSearch: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Единая функция для закрытия модалки и очистки инпута
  const handleClose = () => {
    setIsOpen(false);
    setQuery("");
  };

  // 1. Закрытие по клику вне
  useClickAway(ref, handleClose);

  // В эффекте оставляем ТОЛЬКО работу с DOM (внешней системой)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSearchSubmit = () => {
    if (!query.trim()) return;
    router.push(`/search?q=${encodeURIComponent(query)}`);
    handleClose();
  };

  return (
    <>
      <IconBtn variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        <SearchIcon className="size-5" />
      </IconBtn>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-start pt-[15vh] bg-[#0D0D12]/40 backdrop-blur-[2px]">
          <div ref={ref} className="w-full max-w-150 mx-4 overflow-hidden">
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
                  <p className="text-[#191A1B] text-sm mb-4">
                    Ищем: <span className="font-medium">{query}</span>...
                  </p>

                  <button
                    onClick={handleSearchSubmit}
                    className="text-[#F5653E] text-sm font-medium hover:underline"
                  >
                    Все результаты по запросу «{query}»
                  </button>
                </div>
              ) : (
                <>
                  <RecentSearches />
                  <CategoriesGrid />
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
