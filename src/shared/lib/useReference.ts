"use client";

import { useCallback } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";

import { getUserStatus, referenceKeys } from "@/shared/api";
import { useAuthStore } from "@/shared/store";

// Справочники бэка (/api/references/*) — это перечень значений, которые уже
// встречаются в базе, а не выверенный каталог. Из-за старых форм, которые
// отправляли служебные коды, туда попали "bishkek", "russian", "card",
// "adults"; при этом список бывает неполным (в /cities сейчас один город).
// Поэтому берём с сервера всё человекочитаемое, а сверху кладём локальный
// набор по умолчанию — чтобы форма оставалась пригодной, даже если справочник
// пуст или запрос не прошёл (в вебвью это обычное дело).
export const hasCyrillic = (value: string) => /[Ѐ-ӿ]/.test(value);

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

// Статус текущего пользователя как рецензента (см.
// GET /api/references/user-status/{user_id}/) — по среднему баллу ЕГО
// СОБСТВЕННЫХ отзывов, не рейтинг того, кого он оценивает. Если отзывов нет,
// бэк отдаёт status: null — карточка в этом случае рисуется с нулями
// (см. entities/user-status).
export const useUserStatus = () => {
  const userId = useAuthStore((s) => s.user?.id);

  const { data, isLoading } = useQuery({
    queryKey: referenceKeys.userStatus(userId ?? 0),
    queryFn: () => getUserStatus(userId as number),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  return {
    status: data?.status ?? null,
    percent: data?.percent ?? null,
    isLoading,
  };
};

// Проценты в карточке статуса сервер считает по средней оценке отзывов
// пользователя, поэтому после создания, изменения или удаления отзыва кэш
// статуса надо сбросить — иначе цифры обновлялись только после перезагрузки
// страницы. Ключ берём без id: карточка есть и в меню, и в сайдбаре.
export const useInvalidateUserStatus = () => {
  const queryClient = useQueryClient();

  return useCallback(
    () =>
      queryClient.invalidateQueries({ queryKey: referenceKeys.userStatuses() }),
    [queryClient],
  );
};
