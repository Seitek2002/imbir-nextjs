"use client";

import { useSyncExternalStore } from "react";

// С этой ширины кабинет двухколоночный (сайдбар + раздел) — граница lg.
const QUERY = "(min-width: 1024px)";

const subscribe = (onChange: () => void) => {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
};

/**
 * Десктопный ли сейчас кабинет. Читается синхронно, поэтому при переходе
 * внутри приложения страница сразу знает ширину экрана и не рендерит то,
 * что на десктопе не нужно.
 *
 * На сервере ширины нет — там false: при первой загрузке страницы мобильные
 * пользователи получают свой экран сразу в HTML, а десктоп перерисует его
 * после гидратации.
 */
export const useIsDesktopCabinet = (): boolean =>
  useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
