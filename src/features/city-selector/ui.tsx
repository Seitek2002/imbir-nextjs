"use client";

import { FC, useEffect, useState } from "react";
import toast from "react-hot-toast";

import { GeoIcon } from "@/shared/assets";
import { useCityStore } from "@/shared/store/cityStore";
import { Button, Dropdown, Modal } from "@/shared/ui";

const COUNTRIES_DATA: Record<string, string[]> = {
  Кыргызстан: [
    "Бишкек",
    "Ош",
    "Джалал-Абад",
    "Каракол",
    "Токмок",
    "Кант",
    "Нарын",
    "Талас",
    "Баткен",
  ],
  Россия: ["Москва", "Санкт-Петербург", "Новосибирск", "Екатеринбург"],
  Казахстан: ["Алматы", "Астана", "Шымкент", "Караганда"],
};

const COUNTRY_OPTIONS = Object.keys(COUNTRIES_DATA).map((c) => ({
  value: c,
  label: c,
}));

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export const CitySelectorModal: FC<Props> = ({ isOpen, onClose }) => {
  const { city: currentCity, setCity } = useCityStore();
  const [isDetecting, setIsDetecting] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  useEffect(() => {
    if (isOpen) {
      const country =
        Object.entries(COUNTRIES_DATA).find(([, cities]) =>
          cities.includes(currentCity),
        )?.[0] ?? "";
      setSelectedCountry(country);
      setSelectedCity(currentCity ?? "");
    }
  }, [isOpen, currentCity]);

  const cityOptions = selectedCountry
    ? COUNTRIES_DATA[selectedCountry].map((c) => ({ value: c, label: c }))
    : [];

  const handleCountryChange = (country: string) => {
    setSelectedCountry(country);
    setSelectedCity(COUNTRIES_DATA[country]?.[0] ?? "");
  };

  const handleApply = () => {
    if (!selectedCity) return;
    setCity(selectedCity);
    toast.success(`Город изменен на ${selectedCity}`);
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
    <Modal isOpen={isOpen} onClose={onClose} title="Местоположение">
      <div className="flex flex-col gap-5">
        <Button
          variant="outline"
          className="w-full justify-center border-border text-foreground hover:border-primary hover:text-primary"
          IconLeft={GeoIcon}
          onClick={handleGeoDetect}
          disabled={isDetecting}
        >
          <span className="md:hidden">
            {isDetecting ? "Определяем..." : "Мое текущее местоположение"}
          </span>
          <span className="hidden md:inline">
            {isDetecting
              ? "Определяем..."
              : "Использовать мое текущее местоположение"}
          </span>
        </Button>

        <Dropdown
          label="Страна"
          placeholder="Выберите из списка"
          options={COUNTRY_OPTIONS}
          type="radio"
          value={selectedCountry}
          onChange={handleCountryChange}
        />

        <Dropdown
          label="Город"
          placeholder="Выберите из списка"
          options={cityOptions}
          type="radio"
          value={selectedCity}
          onChange={setSelectedCity}
        />

        <Button
          className="w-full justify-center"
          onClick={handleApply}
          disabled={!selectedCity}
        >
          Выбрать
        </Button>
      </div>
    </Modal>
  );
};
