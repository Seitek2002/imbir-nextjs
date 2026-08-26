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
  applyDetectedCity: (city: string) => void;
  city: string;
  dismiss: () => void;
  // Баннер подтверждения города показан/скрыт (dismiss или подтверждение).
  isSet: boolean;
  // Город выбран пользователем ВРУЧНУЮ (через селектор или «Верно» в баннере).
  // Отличается от isSet: закрытие баннера («Изменить») не считается выбором и
  // не блокирует автоподстановку задетекченного города.
  manuallySelected: boolean;
  setCity: (city: string) => void;
};

export const useCityStore = create<CityStore>()(
  persist(
    (set, get) => ({
      city: DEFAULT_CITY,
      isSet: false,
      manuallySelected: false,

      // Ручной выбор города: и хедер, и каталог начинают слать именно его,
      // автоподстановка детекта больше не перезаписывает.
      setCity: (city) => {
        writeCityCookie(city);
        set({ city, isSet: true, manuallySelected: true });
      },

      // Подставляем город, определённый бэком/middleware по IP (cookie
      // imbir-detected-city), пока пользователь не выбрал город вручную. Так
      // хедер и выдача каталога показывают реальный город пользователя, а не
      // хардкод «Бишкек». No-op, если выбор уже сделан вручную или город тот же.
      applyDetectedCity: (city) => {
        if (get().manuallySelected) return;
        if (!city || city === get().city) return;
        writeCityCookie(city);
        set({ city });
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
