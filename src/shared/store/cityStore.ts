import { create } from "zustand";
import { persist } from "zustand/middleware";

// Default city used before the user picks one — also what the server prefetches
// for SSR, so the dehydrated doctors query matches the client's initial key.
export const DEFAULT_CITY = "Бишкек";

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
      setCity: (city) => set({ city, isSet: true }),
      dismiss: () => set({ isSet: true }),
    }),
    {
      name: "user-city-storage",
    },
  ),
);
