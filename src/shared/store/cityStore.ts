import { create } from "zustand";
import { persist } from "zustand/middleware";

// Default city used before the user picks one — also what the server prefetches
// for SSR, so the dehydrated doctors query matches the client's initial key.
export const DEFAULT_CITY = "Бишкек";

export const CITY_COOKIE = "city";

// Mirror the city into a cookie so the server can read it (localStorage isn't
// available server-side) and SSR-prefetch the right city's doctors.
const writeCityCookie = (city: string) => {
  if (typeof document === "undefined") return;
  document.cookie = `${CITY_COOKIE}=${encodeURIComponent(city)}; path=/; max-age=31536000; samesite=lax`;
};

type CityStore = {
  city: string;
  isSet: boolean;
  setCity: (city: string) => void;
  dismiss: () => void;
};

export const useCityStore = create<CityStore>()(
  persist(
    (set) => ({
      city: DEFAULT_CITY,
      isSet: false,
      setCity: (city) => {
        writeCityCookie(city);
        set({ city, isSet: true });
      },
      dismiss: () => set({ isSet: true }),
    }),
    {
      name: "user-city-storage",
      // Keep the cookie in sync with the persisted value on every load, so
      // existing users (who set their city before cookies existed) also get it.
      onRehydrateStorage: () => (state) => {
        writeCityCookie(state?.city ?? DEFAULT_CITY);
      },
    },
  ),
);
