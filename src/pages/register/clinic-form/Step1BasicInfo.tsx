"use client";

import { useRef } from "react";

import { getClinicTypes, referenceKeys } from "@/shared/api";
import { DEFAULT_CLINIC_TYPES, colors } from "@/shared/config";
import { useReferenceOptions } from "@/shared/lib/useReference";
import { Dropdown, Input } from "@/shared/ui";

import type { ClinicFormData } from "../model/types";
import { PhotoThumb } from "./PhotoThumb";

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
  data: ClinicFormData;
  onChange: <K extends keyof ClinicFormData>(
    key: K,
    value: ClinicFormData[K],
  ) => void;
};

export const Step1BasicInfo = ({ data, onChange }: Props) => {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const photosInputRef = useRef<HTMLInputElement>(null);

  const { options: clinicTypeOptions } = useReferenceOptions(
    referenceKeys.clinicTypes(),
    getClinicTypes,
    DEFAULT_CLINIC_TYPES,
  );

  return (
    <div className="flex flex-col gap-4">
      <Input
        label="Название клиники"
        placeholder="Введите название"
        value={data.clinicName}
        onChange={(e) => onChange("clinicName", e.target.value)}
      />

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-overlay">Логотип</span>
        <input
          ref={logoInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onChange("logo", file);
          }}
        />
        {data.logo ? (
          <div className="flex items-center gap-3 p-3 rounded-xl border border-border">
            <div className="relative size-14 rounded-lg overflow-hidden shrink-0">
              <img
                src={URL.createObjectURL(data.logo)}
                alt="логотип"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => onChange("logo", null)}
                className="absolute top-0 right-0 w-1/2 aspect-square bg-black/60 flex items-center justify-center text-white leading-none"
              >
                ×
              </button>
            </div>
            <span className="text-sm text-muted truncate flex-1">
              {data.logo.name}
            </span>
            <button
              type="button"
              onClick={() => logoInputRef.current?.click()}
              className="px-3 py-1.5 rounded-full border border-border text-secondary text-sm hover:bg-surface transition-colors shrink-0"
            >
              Заменить
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => logoInputRef.current?.click()}
            className="flex items-center justify-center gap-2 p-6 rounded-xl border-2 border-dashed border-border hover:border-primary/40 transition-colors w-full"
          >
            <UploadIcon />
            <span className="text-sm font-medium text-overlay">
              Загрузить логотип
            </span>
          </button>
        )}
      </div>

      <Dropdown
        label="Тип клиники"
        placeholder="Выберите из списка"
        options={clinicTypeOptions}
        value={data.clinicType}
        onChange={(v) => onChange("clinicType", v)}
      />

      <Input
        label="Описание клиники"
        placeholder="Введите описание клиники"
        value={data.description}
        onChange={(e) => onChange("description", e.target.value)}
      />

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-overlay">
          Фотографии клиники
        </span>
        <input
          ref={photosInputRef}
          type="file"
          multiple
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            if (!e.target.files) return;
            onChange("photos", [...data.photos, ...Array.from(e.target.files)]);
            e.target.value = "";
          }}
        />
        <div className="p-3 rounded-xl border border-border min-h-[88px]">
          {data.photos.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {data.photos.map((file, i) => (
                <PhotoThumb
                  key={i}
                  file={file}
                  onRemove={() =>
                    onChange(
                      "photos",
                      data.photos.filter((_, idx) => idx !== i),
                    )
                  }
                />
              ))}
              <button
                type="button"
                onClick={() => photosInputRef.current?.click()}
                className="size-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-primary text-2xl hover:border-primary/40 transition-colors"
              >
                +
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => photosInputRef.current?.click()}
              className="w-full min-h-[72px] flex items-center justify-center gap-2"
            >
              <UploadIcon />
              <span className="text-sm font-medium text-overlay">
                Загрузить фото
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
