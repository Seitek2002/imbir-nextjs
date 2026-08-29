"use client";

import { type ReactNode, useRef, useState } from "react";

import { EyeIcon, EyeOffIcon, UploadCloudIcon } from "@/shared/assets/icons";
import { colors } from "@/shared/config";
import { MAX_DOCUMENT_MB, filterAllowedFiles } from "@/shared/lib/files";
import { Input } from "@/shared/ui";

import type { DoctorFormData } from "../model/types";
import { FileThumb } from "./FileThumb";

const InfoIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    className="shrink-0 mt-0.5"
  >
    <circle cx="9" cy="9" r="8" stroke={colors.muted} strokeWidth="1.5" />
    <path
      d="M9 8v5M9 6h.01"
      stroke={colors.muted}
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

type Props = {
  data: DoctorFormData;
  onChange: <K extends keyof DoctorFormData>(
    key: K,
    value: DoctorFormData[K],
  ) => void;
  passwordError: string;
  // Готовый блок подтверждения контакта от мастера — см. clinic-form.
  verifySlot?: ReactNode;
};

export const Step4Certificates = ({
  data,
  onChange,
  passwordError,
  verifySlot,
}: Props) => {
  const certInputRef = useRef<HTMLInputElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-overlay">Сертификаты</span>
        <input
          ref={certInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,image/*"
          className="sr-only"
          onChange={(e) => {
            if (!e.target.files) return;
            onChange("certificates", [
              ...data.certificates,
              ...filterAllowedFiles(
                Array.from(e.target.files),
                MAX_DOCUMENT_MB,
              ),
            ]);
            e.target.value = "";
          }}
        />
        <div className="p-4 rounded-xl border-2 border-dashed border-border min-h-[112px]">
          {data.certificates.length > 0 ? (
            <div className="flex flex-wrap gap-3">
              {data.certificates.map((file, i) => (
                <FileThumb
                  key={i}
                  file={file}
                  onRemove={() =>
                    onChange(
                      "certificates",
                      data.certificates.filter((_, idx) => idx !== i),
                    )
                  }
                />
              ))}
              <button
                type="button"
                onClick={() => certInputRef.current?.click()}
                className="size-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center text-primary text-2xl hover:border-primary/40 transition-colors"
              >
                +
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => certInputRef.current?.click()}
              className="w-full min-h-[80px] flex items-center justify-center gap-2"
            >
              <UploadCloudIcon className="size-7 text-primary" />
              <span className="text-sm font-medium text-overlay">
                Загрузить документы
              </span>
            </button>
          )}
        </div>
      </div>

      <Input
        label="Лицензия"
        autoComplete="off"
        placeholder="Введите номер лицензии"
        value={data.licenseNumber}
        onChange={(e) => onChange("licenseNumber", e.target.value)}
      />

      <Input
        label="Пароль"
        autoComplete="new-password"
        type={showPassword ? "text" : "password"}
        placeholder="Придумайте пароль"
        IconRight={showPassword ? EyeIcon : EyeOffIcon}
        onIconRightClick={() => setShowPassword((v) => !v)}
        value={data.password}
        onChange={(e) => onChange("password", e.target.value)}
      />
      <Input
        label="Подтвердите пароль"
        autoComplete="new-password"
        type={showConfirm ? "text" : "password"}
        placeholder="Повторите пароль"
        IconRight={showConfirm ? EyeIcon : EyeOffIcon}
        onIconRightClick={() => setShowConfirm((v) => !v)}
        value={data.confirmPassword}
        onChange={(e) => onChange("confirmPassword", e.target.value)}
        error={passwordError}
      />

      {verifySlot}

      <div className="flex gap-3 p-4 rounded-xl bg-background mt-2">
        <InfoIcon />
        <p className="text-sm text-muted">
          После регистрации вы получите доступ к личному кабинету врача, где
          сможете управлять расписанием, просматривать записи пациентов и вести
          историю приёмов
        </p>
      </div>
    </div>
  );
};
