"use client";

import { FC, useEffect, useState } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { SearchInput } from "@/shared/ui";

export const UrlSearchInput: FC<{ placeholder?: string }> = ({
  placeholder = "Поиск",
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialQuery = searchParams.get("q") || "";
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const currentSearch = searchParams.get("q") || "";

      if (query === currentSearch) return;

      const params = new URLSearchParams(searchParams.toString());

      if (query) {
        params.set("q", query);
      } else {
        params.delete("q");
      }

      router.replace(`${pathname}?${params.toString()}`);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, pathname, router, searchParams]);

  return (
    <SearchInput placeholder={placeholder} value={query} onChange={setQuery} />
  );
};
