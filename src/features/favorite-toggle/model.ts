"use client";

import { useMemo } from "react";
import toast from "react-hot-toast";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addFavorite,
  getFavorites,
  profileKeys,
  removeFavorite,
} from "@/shared/api";
import { useAuthStore } from "@/shared/store";

type TargetType = "doctor" | "clinic" | "service";

// Карточки в каталоге (Специалисты/Клиники/Услуги) используют этот хук, чтобы
// сердечко реально сохраняло/убирало избранное через /api/profile/favorites/,
// а не просто переключало локальный вид.
export const useFavoriteToggle = (targetType: TargetType) => {
  const isAuthed = useAuthStore((s) => Boolean(s.accessToken));
  const queryClient = useQueryClient();

  const { data: favorites } = useQuery({
    queryKey: profileKeys.favorites(),
    queryFn: getFavorites,
    enabled: isAuthed,
  });

  // target_id -> id самой записи избранного (нужен для DELETE)
  const favoriteIdByTarget = useMemo(() => {
    const map = new Map<number, number>();
    favorites
      ?.filter((f) => f.target_type === targetType)
      .forEach((f) => map.set(f.target_id, f.id));
    return map;
  }, [favorites, targetType]);

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: profileKeys.favorites() });

  const addMutation = useMutation({
    mutationFn: addFavorite,
    onSuccess: invalidate,
    onError: () => toast.error("Не удалось сохранить. Попробуйте снова"),
  });

  const removeMutation = useMutation({
    mutationFn: removeFavorite,
    onSuccess: invalidate,
    onError: () => toast.error("Не удалось убрать из сохранённых"),
  });

  const isSaved = (targetId: number) => favoriteIdByTarget.has(targetId);

  const toggle = (targetId: number) => {
    if (!isAuthed) {
      toast.error("Войдите в аккаунт, чтобы сохранять в избранное");
      return;
    }
    const favoriteId = favoriteIdByTarget.get(targetId);
    if (favoriteId) {
      removeMutation.mutate(favoriteId);
    } else {
      addMutation.mutate({ target_type: targetType, target_id: targetId });
    }
  };

  return { isSaved, toggle };
};
