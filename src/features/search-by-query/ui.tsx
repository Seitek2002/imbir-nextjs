"use client";

import { FC, useEffect, useState } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { SearchInput } from "@/shared/ui";

const QUERY_KEY = "q";

export const UrlSearchInput: FC<{ placeholder?: string }> = ({
  placeholder = "Поиск клиники, специалиста, услуги",
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlQuery = searchParams.get(QUERY_KEY) || "";

  const [query, setQuery] = useState(urlQuery);
  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery);
  const [lastPushedQuery, setLastPushedQuery] = useState(urlQuery);

  if (urlQuery !== prevUrlQuery) {
    setPrevUrlQuery(urlQuery);

    if (urlQuery !== lastPushedQuery) {
      setQuery(urlQuery);
      setLastPushedQuery(urlQuery);
    }
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query === urlQuery) return;

      setLastPushedQuery(query);

      const params = new URLSearchParams(searchParams.toString());
      if (query) {
        params.set(QUERY_KEY, query);
      } else {
        params.delete(QUERY_KEY);
      }

      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, pathname, router, searchParams, urlQuery]);

  const handleEnter = () => {
    if (query === urlQuery) return;

    setLastPushedQuery(query);

    const params = new URLSearchParams(searchParams.toString());
    if (query) params.set(QUERY_KEY, query);
    else params.delete(QUERY_KEY);

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  return (
    <SearchInput
      placeholder={placeholder}
      value={query}
      onChange={setQuery}
      onEnter={handleEnter}
    />
  );
};
