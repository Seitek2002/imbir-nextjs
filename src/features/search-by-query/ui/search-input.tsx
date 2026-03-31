"use client";

import { FC, useEffect, useState } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Input } from "@/shared";

import { SearchIcon } from "@/shared/assets";

export const SearchInput: FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initialQuery = searchParams.get("search")?.toString() || "";
  const [query, setQuery] = useState(initialQuery);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (query) {
        params.set("search", query);
      } else {
        params.delete("search");
      }

      router.replace(`${pathname}?${params.toString()}`);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, pathname, router, searchParams]);

  return (
    <Input
      IconLeft={SearchIcon}
      placeholder="Поиск клиники, врача, услуги"
      className="w-full rounded-full"
      labelClassName="mt-3"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
    />
  );
};
