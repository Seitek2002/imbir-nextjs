import { create } from "zustand";
import { persist } from "zustand/middleware";

type CityStore = {
  city: string;
  isSet: boolean;
  setCity: (city: string) => void;
};

export const useCityStore = create<CityStore>()(
  persist(
    (set) => ({
      city: "Бишкек",
      isSet: false,
      setCity: (city) => set({ city, isSet: true }),
    }),
    {
      name: "user-city-storage",
    },
  ),
);
