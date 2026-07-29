"use client";

import { useRef } from "react";

import { getCities, getLanguages, referenceKeys } from "@/shared/api";
import { CITIES, colors } from "@/shared/config";
import { useReferenceOptions } from "@/shared/lib/useReference";
import { cn } from "@/shared/lib/utils";
import { Dropdown, Input, PhoneInput } from "@/shared/ui";

import { DEFAULT_LANGUAGES } from "../model/constants";
import type { DoctorFormData } from "../model/types";

const UploadIcon = () => (
  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
    <path
      d="M22 18v3a1 1 0 01-1 1H7a1 1 0 01-1-1v-3"
      stroke={colors.primary}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M14 6v12M10 10l4-4 4 4"
      stroke={colors.primary}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

type Props = {
  data: DoctorFormData;
  onChange: <K extends keyof DoctorFormData>(
    key: K,
    value: DoctorFormData[K],
  ) => void;
};

export const Step1BasicInfo = ({ data, onChange }: Props) => {
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Город и языки — из справочников бэка, поверх локальных наборов по
  // умолчанию: на бэк уходит выбранная строка, а не код.
  const { options: cityOptions } = useReferenceOptions(
    referenceKeys.cities(),
    getCities,
    CITIES,
  );
  const { options: languageOptions } = useReferenceOptions(
    referenceKeys.languages(),
    getLanguages,
    DEFAULT_LANGUAGES,
  );

  return (
    <div className="flex flex-col gap-4">
      <Input
        label="ФИО"
        placeholder="Введите ваше полное имя"
        value={data.fullName}
        onChange={(e) => onChange("fullName", e.target.value)}
      />

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-overlay">Пол</span>
        <div className="flex gap-3">
          {(
            [
              { value: "male", label: "Мужской" },
              { value: "female", label: "Женский" },
            ] as const
          ).map(({ value, label }) => (
            <label
              key={value}
              className={cn(
                "flex-1 flex items-center gap-2.5 p-3 rounded-xl border-2 cursor-pointer transition-all",
                data.gender === value ? "border-primary" : "border-border",
              )}
            >
              <input
                type="radio"
                name="doctor-gender"
                value={value}
                checked={data.gender === value}
                onChange={() => onChange("gender", value)}
                className="sr-only"
              />
              <div
                className={cn(
                  "size-5 rounded-full border-4 flex items-center justify-center shrink-0 transition-all",
                  data.gender === value
                    ? "border-primary"
                    : "border-border-soft",
                )}
              >
                {data.gender === value && (
                  <div className="size-2.5 rounded-full bg-primary" />
                )}
              </div>
              <span className="text-sm font-medium text-overlay">{label}</span>
            </label>
          ))}
        </div>
      </div>

      <Input
        label="Дата рождения"
        placeholder="ДД.ММ.ГГГГ"
        value={data.birthDate}
        onChange={(e) => onChange("birthDate", e.target.value)}
      />

      <Dropdown
        label="Город"
        placeholder="Выберите из списка"
        options={cityOptions}
        searchable
        value={data.city}
        onChange={(v) => onChange("city", v)}
      />

      <Dropdown
        label="Языки общения"
        placeholder="Выберите из списка"
        options={languageOptions}
        isMulti
        value={data.languages}
        onChange={(v) => onChange("languages", v)}
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

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-overlay">Фото</span>
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onChange("photo", file);
          }}
        />
        {data.photo ? (
          <div className="flex items-center gap-3 p-3 rounded-xl border border-border">
            <div className="relative size-14 rounded-lg overflow-hidden shrink-0">
              <img
                src={URL.createObjectURL(data.photo)}
                alt="фото"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => onChange("photo", null)}
                className="absolute top-0 right-0 w-1/2 aspect-square bg-black/60 flex items-center justify-center text-white leading-none"
              >
                ×
              </button>
            </div>
            <span className="text-sm text-muted truncate flex-1">
              {data.photo.name}
            </span>
            <button
              onClick={() => photoInputRef.current?.click()}
              className="px-3 py-1.5 rounded-full border border-border text-secondary text-sm hover:bg-surface transition-colors shrink-0"
            >
              Заменить
            </button>
          </div>
        ) : (
          <button
            onClick={() => photoInputRef.current?.click()}
            className="flex items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-border hover:border-primary/40 transition-colors w-full"
          >
            <UploadIcon />
            <span className="text-sm font-medium text-overlay">
              Загрузить фото
            </span>
          </button>
        )}
      </div>
    </div>
  );
};
