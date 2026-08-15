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
