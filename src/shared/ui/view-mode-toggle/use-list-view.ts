"use client";

import { useIsMobile } from "@/shared/lib/useIsMobile";
import { type ListViewMode, useListViewStore } from "@/shared/store";

type ListView = {
  // Классы видимости для двух веток разметки. Обе ветки остаются в DOM, как и
  // до переключателя: так серверный рендер не зависит от localStorage и при
  // регидрации ничего не мигает.
  cardsClassName: string;
  mode: ListViewMode;
  setMode: (mode: ListViewMode) => void;
  tableClassName: string;
};

/**
 * Вид списков в кабинете — карточками или таблицей.
 *
 * Пока пользователь не выбрал сам, вид определяет ширина экрана: карточки на
 * телефоне, таблица от md. Это ровно то поведение, что было до переключателя,
 * и оно остаётся дефолтом. Выбранный вручную вид действует на всех ширинах.
 */
export const useListView = (): ListView => {
  const stored = useListViewStore((state) => state.mode);
  const setMode = useListViewStore((state) => state.setMode);
  const isMobile = useIsMobile();

  // Что подсвечено в переключателе. При stored === null это зависит от ширины
  // экрана — иначе на телефоне активной выглядела бы таблица, которой там нет.
  const mode: ListViewMode = stored ?? (isMobile ? "cards" : "table");

  return {
    mode,
    setMode,
    cardsClassName:
      stored === null ? "md:hidden" : stored === "cards" ? "" : "hidden",
    tableClassName:
      stored === null
        ? "hidden md:block"
        : stored === "table"
          ? "block"
          : "hidden",
  };
};
