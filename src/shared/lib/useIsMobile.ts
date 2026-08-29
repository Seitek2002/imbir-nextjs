"use client";

import { useSyncExternalStore } from "react";

// Тот же брейкпоинт, что у md: в Tailwind: до него дропдаун показывает нижнюю
// шторку, после — выпадающее меню под триггером. Раньше это условие читалось
// из window.innerWidth прямо в обработчиках, поэтому при повороте экрана
// поведение оставалось от старой ширины.
const QUERY = "(max-width: 767px)";

const subscribe = (onChange: () => void) => {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
};

export const useIsMobile = (): boolean =>
  useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    // На сервере ширины нет — считаем десктопом, как и вся остальная разметка.
    () => false,
  );
