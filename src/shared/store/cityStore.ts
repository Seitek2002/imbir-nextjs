import { create } from "zustand";
import { persist } from "zustand/middleware";

type CityStore = {
  city: string;
  setCity: (city: string) => void;
};

export const useCityStore = create<CityStore>()(
  persist(
    (set) => ({
      city: "Бишкек", // По умолчанию
      setCity: (city) => set({ city }),
    }),
    {
      name: "user-city-storage",
    },
  ),
);
