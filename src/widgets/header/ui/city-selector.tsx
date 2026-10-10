"use client";

import { FC, useState } from "react";
import toast from "react-hot-toast";

import { GeoIcon } from "@/shared/assets/icons";
import {
  CITIES_BY_COUNTRY as COUNTRIES_DATA,
  findNearestCity,
} from "@/shared/config";
import { useCityStore } from "@/shared/store";
import { Button, Dropdown, Modal } from "@/shared/ui";

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

  // Синхронизация выбора при открытии — прямо в рендере (паттерн
  // «adjust state during render» вместо setState в эффекте).
  const [wasOpen, setWasOpen] = useState(false);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      const country =
        Object.entries(COUNTRIES_DATA).find(([, cities]) =>
          cities.includes(currentCity),
        )?.[0] ?? "";
      setSelectedCountry(country);
      setSelectedCity(currentCity ?? "");
    }
  }

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
        // Город — ближайший из нашего списка к координатам устройства. Раньше
        // здесь была заглушка, которая всегда ставила «Бишкек», и пользователь
        // из Оша оставался с чужим городом (а setCity к тому же отключает
        // автоподстановку города по IP).
        setIsDetecting(false);
        const city = findNearestCity({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        if (!city) {
          // Рядом нет ни одного города из списка — ничего не подменяем,
          // пусть человек выберет город сам.
          toast.error("Не нашли ваш город в списке. Выберите его вручную", {
            id: "geo",
          });
          return;
        }
        setCity(city);
        toast.success(`Город изменен на ${city}`, { id: "geo" });
        onClose();
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
          size="sm"
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
