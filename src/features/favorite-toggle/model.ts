"use client";

import { useRef, useState } from "react";
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
  // Айди целей, на которые прямо сейчас летит запрос. Ref, а не useState:
  // setState применяется асинхронно, и при нескольких кликах подряд в одном
  // тике (проверено вживую — три быстрых клика уходили тремя одинаковыми
  // DELETE) все они читали бы ещё не обновлённое значение и проходили бы
  // проверку. Ref читается и пишется сразу же, поэтому второй клик в той же
  // миллисекунде уже видит, что первый занял id.
  const pendingIds = useRef<Set<number>>(new Set());
  // Сам факт занятости не рисуется без re-render — этот счётчик его вызывает.
  const [, forceUpdate] = useState(0);

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

  // targetId приходит из variables мутации (третий аргумент onSettled),
  // а не замыканием из toggle() — иначе при двух карточках, отправленных
  // подряд, оба settle() снимали бы pending с id, назначенного последним
  // вызовом toggle.
  const settle = (targetId: number) => {
    queryClient.invalidateQueries({ queryKey: profileKeys.favorites() });
    pendingIds.current.delete(targetId);
    forceUpdate((n) => n + 1);
  };

  const addMutation = useMutation({
    mutationFn: addFavorite,
    onMutate: (body) => ({ previous: patchCache(body.target_id, true) }),
    onError: (_error, _body, context) => {
      if (context) {
        queryClient.setQueryData(profileKeys.favorites(), context.previous);
      }
      toast.error("Не удалось сохранить. Попробуйте снова");
    },
    onSettled: (_data, _error, body) => settle(body.target_id),
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
    onSettled: (_data, _error, body) => settle(body.target_id),
  });

  const isSaved = (targetId: number) => savedIds.has(targetId);
  // Карточка использует это, чтобы показать спиннер вместо сердца.
  const isPending = (targetId: number) => pendingIds.current.has(targetId);

  const toggle = (targetId: number) => {
    if (!isAuthed) {
      toast.error("Войдите в аккаунт, чтобы сохранять в избранное");
      return;
    }
    // Уже в процессе — новый клик не ставим в очередь, а просто игнорируем:
    // сеть ещё не успела ответить на первый запрос по этой же карточке.
    if (pendingIds.current.has(targetId)) return;
    pendingIds.current.add(targetId);
    forceUpdate((n) => n + 1);

    const body = { target_type: targetType, target_id: targetId };
    if (savedIds.has(targetId)) removeMutation.mutate(body);
    else addMutation.mutate(body);
  };

  return { isSaved, isPending, toggle };
};
