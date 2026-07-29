"use client";

import { useQuery } from "@tanstack/react-query";

// Справочники бэка (/api/references/*) — это перечень значений, которые уже
// встречаются в базе, а не выверенный каталог. Из-за старых форм, которые
// отправляли служебные коды, туда попали "bishkek", "russian", "card",
// "adults"; при этом список бывает неполным (в /cities сейчас один город).
// Поэтому берём с сервера всё человекочитаемое, а сверху кладём локальный
// набор по умолчанию — чтобы форма оставалась пригодной, даже если справочник
// пуст или запрос не прошёл (в вебвью это обычное дело).
const hasCyrillic = (value: string) => /[Ѐ-ӿ]/.test(value);

export const mergeReference = (
  fallback: string[],
  remote: string[],
): string[] => {
  const seen = new Set(fallback.map((value) => value.toLowerCase()));
  const merged = [...fallback];

  for (const value of remote) {
    const key = value.toLowerCase();
    if (!hasCyrillic(value) || seen.has(key)) continue;
    seen.add(key);
    merged.push(value);
  }

  return merged;
};

export const useReferenceValues = (
  queryKey: readonly unknown[],
  queryFn: () => Promise<string[]>,
  fallback: string[] = [],
) => {
  const { data = [], isLoading } = useQuery({
    queryKey,
    queryFn,
    staleTime: 60 * 60 * 1000,
  });

  return { values: mergeReference(fallback, data), isLoading };
};

export const useReferenceOptions = (
  queryKey: readonly unknown[],
  queryFn: () => Promise<string[]>,
  fallback: string[] = [],
) => {
  const { values, isLoading } = useReferenceValues(queryKey, queryFn, fallback);

  return {
    options: values.map((value) => ({ label: value, value })),
    isLoading,
  };
};
