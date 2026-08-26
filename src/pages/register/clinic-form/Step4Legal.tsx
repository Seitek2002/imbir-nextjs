"use client";

import { useRef } from "react";

import { colors } from "@/shared/config";
import { DateField, Input } from "@/shared/ui";

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

export const Step4Legal = ({ data, onChange }: Props) => {
  const docsInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-4">
      <Input
        label="Юридическое название"
        autoComplete="off"
        placeholder="Введите название"
        value={data.legalName}
        onChange={(e) => onChange("legalName", e.target.value)}
      />
      <Input
        label="Регистрационный номер"
        autoComplete="off"
        placeholder="Введите номер"
        value={data.registrationNumber}
        onChange={(e) => onChange("registrationNumber", e.target.value)}
      />
      <Input
        label="Номер лицензии"
        autoComplete="off"
        placeholder="Введите номер"
        value={data.licenseNumber}
        onChange={(e) => onChange("licenseNumber", e.target.value)}
      />
      <DateField
        label="Дата выдачи лицензии"
        value={data.licenseDate}
        onChange={(v) => onChange("licenseDate", v)}
        maxToday
      />
      <Input
        label="Орган, выдавший лицензию"
        autoComplete="off"
        placeholder="Введите название органа"
        value={data.licensingAuthority}
        onChange={(e) => onChange("licensingAuthority", e.target.value)}
      />

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-overlay">
          Документы (лицензия, регистрационные документы)
        </span>
        <input
          ref={docsInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,image/*"
          className="sr-only"
          onChange={(e) => {
            if (!e.target.files) return;
            onChange("documents", [
              ...data.documents,
              ...Array.from(e.target.files),
            ]);
            e.target.value = "";
          }}
        />
        <div className="p-4 rounded-xl border-2 border-dashed border-border min-h-[112px]">
          {data.documents.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {data.documents.map((file, i) => (
                <PhotoThumb
                  key={i}
                  file={file}
                  onRemove={() =>
                    onChange(
                      "documents",
                      data.documents.filter((_, idx) => idx !== i),
                    )
                  }
                />
              ))}
              <button
                type="button"
                onClick={() => docsInputRef.current?.click()}
                className="size-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-primary text-2xl hover:border-primary/40 transition-colors"
              >
                +
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => docsInputRef.current?.click()}
              className="w-full min-h-[80px] flex items-center justify-center gap-2"
            >
              <UploadIcon />
              <span className="text-sm font-medium text-overlay">
                Загрузить документы
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
