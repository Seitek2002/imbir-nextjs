"use client";

import { useMemo, useSyncExternalStore } from "react";

import { useSearchParams } from "next/navigation";

const URL_STATE_EVENT = "imbir:url-state-change";

const subscribe = (onStoreChange: () => void) => {
  window.addEventListener(URL_STATE_EVENT, onStoreChange);
  window.addEventListener("popstate", onStoreChange);

  return () => {
    window.removeEventListener(URL_STATE_EVENT, onStoreChange);
    window.removeEventListener("popstate", onStoreChange);
  };
};

export const replaceUrlState = (params: URLSearchParams) => {
  if (typeof window === "undefined") return;

  const query = params.toString();
  const url = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
  // Next.js patches window.history.replaceState and may start an App Router
  // update. Calling the native prototype keeps filter changes client-only.
  History.prototype.replaceState.call(
    window.history,
    window.history.state,
    "",
    url,
  );
  window.dispatchEvent(new Event(URL_STATE_EVENT));
};

export const pushUrlState = (params: URLSearchParams) => {
  if (typeof window === "undefined") return;

  const query = params.toString();
  const url = `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`;
  History.prototype.pushState.call(
    window.history,
    window.history.state,
    "",
    url,
  );
  window.dispatchEvent(new Event(URL_STATE_EVENT));
};

/**
 * Next's useSearchParams is not guaranteed to update after a native
 * history.replaceState call. This hook keeps the fast, navigation-free URL
 * update while making every filter consumer react immediately.
 */
export const useUrlSearchParams = () => {
  const nextSearchParams = useSearchParams();
  const serverSearch = nextSearchParams?.toString() ?? "";

  const search = useSyncExternalStore(
    subscribe,
    () => window.location.search,
    () => (serverSearch ? `?${serverSearch}` : ""),
  );

  return useMemo(() => new URLSearchParams(search), [search]);
};

// Ключи фильтров в адресе. Список один на всех: раньше он был переписан в
// FilterBar и на странице услуг по отдельности, и «Сбросить фильтры» в двух
// местах чистило разные наборы.
const FILTER_KEYS = ["spec", "exp", "rating", "price", "clinic"] as const;

/** Копия параметров без фильтров этого раздела. */
export const clearFilterParams = (
  prefix: string,
  params: URLSearchParams,
): URLSearchParams => {
  const next = new URLSearchParams(params.toString());
  FILTER_KEYS.forEach((key) => next.delete(`${prefix}_${key}`));
  return next;
};

/** Задан ли хоть один фильтр — по нему решаем, предлагать ли сброс. */
export const hasFilterParams = (
  prefix: string,
  params: URLSearchParams,
): boolean => FILTER_KEYS.some((key) => params.has(`${prefix}_${key}`));
