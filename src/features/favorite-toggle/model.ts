"use client";

import toast from "react-hot-toast";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  EMPTY_FAVORITES,
  type FavoriteTargetType,
  type FavoritesList,
  addFavorite,
  getFavorites,
  profileKeys,
  removeFavorite,
} from "@/shared/api";
import { useAuthStore } from "@/shared/store";

// Ключ группы в ответе /api/profile/favorites/ для каждого типа цели.
const GROUP: Record<FavoriteTargetType, keyof FavoritesList> = {
  doctor: "doctors",
  clinic: "clinics",
  service: "services",
};

// Карточки в каталоге (Специалисты/Клиники/Услуги) и страницы деталей
// используют этот хук, чтобы сердечко реально сохраняло/убирало избранное
// через /api/profile/favorites/, а не просто переключало локальный вид.
export const useFavoriteToggle = (targetType: FavoriteTargetType) => {
  const isAuthed = useAuthStore((s) => Boolean(s.accessToken));
  const queryClient = useQueryClient();

  const { data: favorites = EMPTY_FAVORITES } = useQuery({
    queryKey: profileKeys.favorites(),
    queryFn: getFavorites,
    enabled: isAuthed,
  });

  const savedIds = new Set(favorites[GROUP[targetType]].map((item) => item.id));

  // Сердечко должно отзываться сразу, поэтому правим кеш до ответа сервера и
  // откатываем, если запрос не прошёл.
  const patchCache = (targetId: number, saved: boolean) => {
    const previous =
      queryClient.getQueryData<FavoritesList>(profileKeys.favorites()) ??
      EMPTY_FAVORITES;
    const group = GROUP[targetType];
    const items = previous[group];

    queryClient.setQueryData<FavoritesList>(profileKeys.favorites(), {
      ...previous,
      [group]: saved
        ? [...items, { id: targetId } as (typeof items)[number]]
        : items.filter((item) => item.id !== targetId),
    });

    return previous;
  };

  const settle = () =>
    queryClient.invalidateQueries({ queryKey: profileKeys.favorites() });

  const addMutation = useMutation({
    mutationFn: addFavorite,
    onMutate: (body) => ({ previous: patchCache(body.target_id, true) }),
    onError: (_error, _body, context) => {
      if (context) {
        queryClient.setQueryData(profileKeys.favorites(), context.previous);
      }
      toast.error("Не удалось сохранить. Попробуйте снова");
    },
    onSettled: settle,
  });

  const removeMutation = useMutation({
    mutationFn: removeFavorite,
    onMutate: (body) => ({ previous: patchCache(body.target_id, false) }),
    onError: (_error, _body, context) => {
      if (context) {
        queryClient.setQueryData(profileKeys.favorites(), context.previous);
      }
      toast.error("Не удалось убрать из сохранённых");
    },
    onSettled: settle,
  });

  const isSaved = (targetId: number) => savedIds.has(targetId);

  const toggle = (targetId: number) => {
    if (!isAuthed) {
      toast.error("Войдите в аккаунт, чтобы сохранять в избранное");
      return;
    }

    const body = { target_type: targetType, target_id: targetId };
    if (savedIds.has(targetId)) removeMutation.mutate(body);
    else addMutation.mutate(body);
  };

  return { isSaved, toggle };
};
