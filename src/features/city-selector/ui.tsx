"use client";

import { FC, useState } from "react";
import toast from "react-hot-toast";

import { GeoIcon } from "@/shared/assets";
import { useCityStore } from "@/shared/store/cityStore";
import { Button, Modal, SearchInput } from "@/shared/ui";

const CITIES = [
  "Бишкек",
  "Ош",
  "Джалал-Абад",
  "Каракол",
  "Токмок",
  "Кант",
  "Нарын",
  "Талас",
  "Баткен",
];

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export const CitySelectorModal: FC<Props> = ({ isOpen, onClose }) => {
  const { city: currentCity, setCity } = useCityStore();
  const [search, setSearch] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);

  const filteredCities = CITIES.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelectCity = (cityName: string) => {
    setCity(cityName);
    toast.success(`Город изменен на ${cityName}`);
    onClose();
  };

  const handleGeoDetect = () => {
    if (!navigator.geolocation) {
      toast.error("Геолокация не поддерживается вашим браузером");
      return;
    }

    setIsDetecting(true);
    toast.loading("Определяем ваше местоположение...", { id: "geo" });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // В РЕАЛЬНОМ ПРОЕКТЕ здесь будет запрос к Yandex Map API или Google Maps API
        // const { latitude, longitude } = position.coords;
        // const cityName = await fetch(`https://geocode-api...`);

        // Для примера имитируем задержку и успешное определение (например, Бишкек)
        console.log(position);
        setTimeout(() => {
          setCity("Бишкек");
          setIsDetecting(false);
          toast.success("Местоположение определено!", { id: "geo" });
          onClose();
        }, 1000);
      },
      (error) => {
        setIsDetecting(false);
        toast.error(`Доступ к геолокации запрещен ${error.message}`, {
          id: "geo",
        });
      },
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Выберите город">
      <div className="flex flex-col gap-4">
        {/* Кнопка гео-определения */}
        <Button
          variant="outline"
          className="w-full justify-center py-3 border-[#F5653E] text-[#F5653E] bg-[#FFF2F0] hover:bg-[#FFE5DF]"
          IconLeft={GeoIcon}
          onClick={handleGeoDetect}
          disabled={isDetecting}
        >
          {isDetecting ? "Определяем..." : "Определить местоположение"}
        </Button>

        {/* Поиск */}
        <SearchInput
          placeholder="Поиск города..."
          value={search}
          onChange={setSearch}
        />

        {/* Список городов */}
        <div className="flex flex-col mt-2">
          {filteredCities.length === 0 ? (
            <p className="text-center text-[#838A8D] py-4">Город не найден</p>
          ) : (
            filteredCities.map((c) => (
              <button
                key={c}
                onClick={() => handleSelectCity(c)}
                className={`text-left px-4 py-3 rounded-xl transition-colors ${
                  currentCity === c
                    ? "bg-[#F5653E] text-white font-medium"
                    : "hover:bg-gray-100 text-[#191A1B]"
                }`}
              >
                {c}
              </button>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};
