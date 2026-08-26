"use client";

import { getCities, referenceKeys } from "@/shared/api";
import { CITIES_BY_COUNTRY, DEFAULT_COUNTRY } from "@/shared/config";
import { useReferenceOptions } from "@/shared/lib/useReference";
import {
  Dropdown,
  Input,
  LocationPicker,
  type LocationValue,
  PhoneInput,
} from "@/shared/ui";

import type { ClinicFormData } from "../model/types";

type Props = {
  data: ClinicFormData;
  emailError?: null | string;
  onChange: <K extends keyof ClinicFormData>(
    key: K,
    value: ClinicFormData[K],
  ) => void;
};

export const Step2Location = ({ data, onChange, emailError }: Props) => {
  // Временно только Кыргызстан — по просьбе поддержки, чтобы у операторов не
  // возникало вопросов из-за случайно выбранной другой страны при
  // регистрации. Города — из /references/cities/ поверх локального каталога.
  const countryOptions = [{ label: DEFAULT_COUNTRY, value: DEFAULT_COUNTRY }];

  const { options: cityOptions } = useReferenceOptions(
    referenceKeys.cities(),
    getCities,
    CITIES_BY_COUNTRY[data.country] ?? [],
  );

  const handleLocationChange = (value: LocationValue) => {
    onChange("latitude", value.latitude);
    onChange("longitude", value.longitude);
  };

  return (
    <div className="flex flex-col gap-4">
      <Dropdown
        label="Страна"
        placeholder="Выберите из списка"
        options={countryOptions}
        searchable
        value={data.country}
        onChange={(v) => onChange("country", v)}
      />
      <Dropdown
        label="Город"
        placeholder="Выберите из списка"
        options={cityOptions}
        searchable
        value={data.city}
        onChange={(v) => onChange("city", v)}
      />
      <Input
        label="Полный адрес"
        autoComplete="street-address"
        placeholder="Введите полный адрес"
        value={data.fullAddress}
        onChange={(e) => onChange("fullAddress", e.target.value)}
      />
      <PhoneInput
        label="Телефон"
        value={data.phone}
        onChange={(v) => onChange("phone", v)}
        // Код страны нужен отдельно: бэк и OTP-гейт ждут полный номер, а
        // PhoneInput отдаёт только цифры без кода.
        onCountryChange={(country) =>
          onChange("phoneDialCode", country.dialCode)
        }
      />
      <Input
        label="Почта"
        autoComplete="email"
        type="email"
        placeholder="Введите вашу почту"
        value={data.email}
        onChange={(e) => onChange("email", e.target.value)}
        error={emailError ?? undefined}
      />
      <Input
        label="Сайт (если есть)"
        autoComplete="url"
        placeholder="Введите ссылку на сайт"
        value={data.website}
        onChange={(e) => onChange("website", e.target.value)}
      />

      {/* Пин на карте — единственный источник latitude/longitude в форме.
          Обратный геокодинг дозаполняет «Полный адрес» выше, но оставляет его
          доступным для правки: OSM знает не каждый дом в Бишкеке. */}
      <LocationPicker
        latitude={data.latitude}
        longitude={data.longitude}
        city={data.city}
        country={data.country}
        address={data.fullAddress}
        onChange={handleLocationChange}
        onAddressChange={(address) => onChange("fullAddress", address)}
      />
    </div>
  );
};
