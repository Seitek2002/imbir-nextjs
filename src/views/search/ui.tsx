"use client";

import { FC, useEffect, useState } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { CategoriesGrid } from "@/widgets/categories-grid/ui";
import { Header } from "@/widgets/header";
import { RecentSearches } from "@/widgets/recent-searches/ui";

import { SearchInput } from "@/shared/ui";

const QUERY_KEY = "q";

export const SearchPage: FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialQuery = searchParams.get(QUERY_KEY) || "";
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const currentSearch = searchParams.get(QUERY_KEY) || "";

      if (query === currentSearch) return;

      const params = new URLSearchParams(searchParams.toString());
      if (query) {
        params.set(QUERY_KEY, query);
      } else {
        params.delete(QUERY_KEY);
      }

      router.replace(`${pathname}?${params.toString()}`);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, pathname, router, searchParams]);

  const activeQuery = searchParams.get(QUERY_KEY) || "";

  const handleEnter = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (query) params.set(QUERY_KEY, query);
    else params.delete(QUERY_KEY);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-[#F2F3F5]">
      <Header title="Поиск" backTo="/">
        <SearchInput value={query} onChange={setQuery} onEnter={handleEnter} />
      </Header>

      {activeQuery ? (
        <div className="p-4">
          <h2 className="text-[#191A1B] text-lg font-medium mb-3">
            Результаты по запросу: {activeQuery}
          </h2>
          {/* Сюда позже вставишь виджет со списком врачей */}
        </div>
      ) : (
        <div className="lg:hidden">
          <RecentSearches />
          <CategoriesGrid />
        </div>
      )}
    </main>
  );
};
