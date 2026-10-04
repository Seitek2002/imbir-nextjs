"use client";

import {
  type ReactNode,
  createContext,
  createElement,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from "react";

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

// Строка запроса, с которой страницу отрендерил сервер. Пустая строка — либо
// параметров нет, либо страница статическая и сервер их не знает в принципе.
const ServerSearchContext = createContext("");

/**
 * Сообщает потребителям useUrlSearchParams, с какими параметрами адреса
 * страницу рендерит сервер. Ставится в app/<маршрут>/page.tsx у страниц,
 * которые читают searchParams на сервере (каталоги, поиск): иначе серверный
 * HTML собрался бы без фильтров и разошёлся с префетчем данных.
 *
 * Статическим страницам (главная) провайдер не нужен и вреден:
 * useSearchParams на них выключает серверный рендер всего поддерева до
 * ближайшего Suspense — в HTML вместо контента уезжает скелетон.
 */
export const UrlSearchParamsProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const search = useSearchParams()?.toString() ?? "";

  return createElement(
    ServerSearchContext.Provider,
    { value: search },
    children,
  );
};

/**
 * Переводит навигацию роутера Next в то же событие, которым оповещают
 * replaceUrlState/pushUrlState. Нужен там, где потребитель useUrlSearchParams
 * переживает переход — например, с «/specialists?doc_rating=5.0» на
 * «/specialists» по ссылке в шапке. Адрес в этот момент меняет сам Next, причём
 * уже после рендера: без моста список оставался отфильтрованным при пустом
 * адресе и сброшенных фильтрах.
 *
 * Монтируется один раз на всё приложение (app/providers.tsx) и обязательно
 * внутри своего <Suspense>: на статических страницах useSearchParams
 * выключает серверный рендер — пусть выключает только этот пустой компонент.
 */
export const UrlStateBridge = () => {
  const search = useSearchParams()?.toString() ?? "";

  useEffect(() => {
    window.dispatchEvent(new Event(URL_STATE_EVENT));
  }, [search]);

  return null;
};

/**
 * Next's useSearchParams is not guaranteed to update after a native
 * history.replaceState call. This hook keeps the fast, navigation-free URL
 * update while making every filter consumer react immediately.
 *
 * Сам useSearchParams здесь не вызывается намеренно — см. комментарий к
 * UrlSearchParamsProvider. Серверное значение приходит из контекста, а за
 * изменениями адреса следит подписка: свои события плюс UrlStateBridge.
 */
export const useUrlSearchParams = () => {
  const serverSearch = useContext(ServerSearchContext);

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
