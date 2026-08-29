import { create } from "zustand";
import { persist } from "zustand/middleware";

// Вид списков в кабинетах: карточками или таблицей.
//
// null — «как решит ширина экрана»: карточки на телефоне, таблица от md.
// Ровно так списки вели себя до появления переключателя, и это остаётся
// поведением по умолчанию — пока пользователь не выбрал сам, ничего не
// меняется. Выбранный вручную вид действует на всех ширинах: на узком экране
// таблица останется таблицей с горизонтальным скроллом, и это осознанный
// выбор пользователя, а не случайность вёрстки.
export type ListViewMode = "cards" | "table";

type ListViewStore = {
  mode: ListViewMode | null;
  setMode: (mode: ListViewMode) => void;
};

export const useListViewStore = create<ListViewStore>()(
  persist(
    (set) => ({
      mode: null,
      setMode: (mode) => set({ mode }),
    }),
    { name: "imbir-list-view" },
  ),
);
