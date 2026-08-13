"use client";

import { getCities, referenceKeys } from "@/shared/api";
import { CITIES_BY_COUNTRY, DEFAULT_COUNTRY, colors } from "@/shared/config";
import { useReferenceOptions } from "@/shared/lib/useReference";
import { Dropdown, Input, PhoneInput } from "@/shared/ui";

import type { ClinicFormData } from "../model/types";

type Props = {
  data: ClinicFormData;
  onChange: <K extends keyof ClinicFormData>(
    key: K,
    value: ClinicFormData[K],
  ) => void;
};

export const Step2Location = ({ data, onChange }: Props) => {
  // Временно только Кыргызстан — по просьбе поддержки, чтобы у операторов не
  // возникало вопросов из-за случайно выбранной другой страны при
  // регистрации. Города — из /references/cities/ поверх локального каталога.
  const countryOptions = [{ label: DEFAULT_COUNTRY, value: DEFAULT_COUNTRY }];

  const { options: cityOptions } = useReferenceOptions(
    referenceKeys.cities(),
    getCities,
    CITIES_BY_COUNTRY[data.country] ?? [],
  );

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
        placeholder="Введите полный адрес"
        value={data.fullAddress}
        onChange={(e) => onChange("fullAddress", e.target.value)}
      />
      <PhoneInput
        label="Телефон"
        value={data.phone}
        onChange={(v) => onChange("phone", v)}
      />
      <Input
        label="Почта"
        type="email"
        placeholder="Введите вашу почту"
        value={data.email}
        onChange={(e) => onChange("email", e.target.value)}
      />
      <Input
        label="Сайт (если есть)"
        placeholder="Введите ссылку на сайт"
        value={data.website}
        onChange={(e) => onChange("website", e.target.value)}
      />

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-overlay">Геолокация</span>
        <div className="rounded-xl overflow-hidden border border-border">
          <div className="relative h-44 bg-[#E8EAED] flex items-center justify-center">
            <div className="absolute inset-0 opacity-20">
              <svg width="100%" height="100%">
                <defs>
                  <pattern
                    id="grid"
                    width="40"
                    height="40"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 40 0 L 0 0 0 40"
                      fill="none"
                      stroke="#888"
                      strokeWidth="0.5"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>
            <div className="relative z-10 flex flex-col items-center gap-1">
              <div className="size-10 rounded-full bg-primary flex items-center justify-center shadow-lg">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path
                    d="M10 1.667A5.833 5.833 0 0110 13.333C6.667 13.333 4.167 8.333 4.167 7.5a5.833 5.833 0 015.833-5.833z"
                    stroke={colors.primary}
                    strokeWidth="1.5"
                  />
                  <circle cx="10" cy="7.5" r="2" fill={colors.primary} />
                </svg>
              </div>
            </div>
            <button
              type="button"
              className="absolute bottom-3 right-3 size-9 bg-white rounded-full shadow flex items-center justify-center"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 1l2.5 13L8 11.5 5.5 14 8 1z"
                  stroke={colors.primary}
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
          <div className="px-4 py-3 bg-white flex items-center gap-2">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="shrink-0"
            >
              <path
                d="M8 1.333A4.667 4.667 0 018 10.667C5.333 10.667 3.333 6.667 3.333 6a4.667 4.667 0 014.667-4.667z"
                stroke={colors.muted}
                strokeWidth="1.2"
              />
              <circle cx="8" cy="6" r="1.5" fill={colors.muted} />
            </svg>
            <span className="text-sm text-foreground">
              {data.fullAddress || "Выберите адрес на карте"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
