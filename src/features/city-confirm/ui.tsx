"use client";

import { useState, useSyncExternalStore } from "react";

import { GeoIcon } from "@/shared/assets/icons";
import { useCityStore } from "@/shared/store";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name: string, value: string) {
  document.cookie = `${name}=${value}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
}

// Cookies don't change during the lifetime of this component, so the
// subscribe callback is a no-op — we only need the server/client split.
const noopSubscribe = () => () => {};

/**
 * Reads the detected-city cookie. On the server the snapshot is always null,
 * so the first client render matches the server (both render nothing) and the
 * banner only appears on a subsequent client render — no hydration mismatch.
 */
function useDetectedCity(): string | null {
  return useSyncExternalStore(
    noopSubscribe,
    () => getCookie("imbir-detected-city"),
    () => null,
  );
}

export const CityConfirmBanner = () => {
  const { isSet, setCity, dismiss } = useCityStore();
  const detectedCity = useDetectedCity();
  const [closed, setClosed] = useState(false);

  if (closed || !detectedCity || isSet) return null;

  const handleConfirm = () => {
    setCity(detectedCity);
    setCookie("imbir-city-set", "1");
    setClosed(true);
  };

  const handleChange = () => {
    dismiss();
    setClosed(true);
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4">
      <div className="bg-white rounded-2xl shadow-lg border border-border px-4 py-3 flex items-center gap-3">
        <div className="size-8 rounded-full bg-[#FEF3F0] flex items-center justify-center shrink-0">
          <GeoIcon className="size-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted">Ваш город</p>
          <p className="text-sm font-semibold text-foreground truncate">
            {detectedCity}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleChange}
            className="text-xs text-muted hover:text-foreground transition-colors px-2 py-1"
          >
            Изменить
          </button>
          <button
            onClick={handleConfirm}
            className="text-xs font-medium text-white bg-primary hover:bg-primary-dark transition-colors px-3 py-1.5 rounded-lg"
          >
            Верно
          </button>
        </div>
      </div>
    </div>
  );
};
