"use client";

import { type ReactNode, useState } from "react";

import { EyeIcon, EyeOffIcon } from "@/shared/assets/icons";
import { colors } from "@/shared/config";
import { Checkbox, Input } from "@/shared/ui";

import type { ClinicFormData } from "../model/types";

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
  data: ClinicFormData;
  onChange: <K extends keyof ClinicFormData>(
    key: K,
    value: ClinicFormData[K],
  ) => void;
  passwordError: string;
  // Блок подтверждения контакта. Мастер отдаёт его готовым — этот шаг только
  // выбирает, где он стоит: между согласиями и пояснением.
  verifySlot?: ReactNode;
};

export const Step7Completion = ({
  data,
  onChange,
  passwordError,
  verifySlot,
}: Props) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <Input
        label="Пароль"
        type={showPassword ? "text" : "password"}
        placeholder="Придумайте пароль"
        IconRight={showPassword ? EyeIcon : EyeOffIcon}
        onIconRightClick={() => setShowPassword((v) => !v)}
        value={data.password}
        onChange={(e) => onChange("password", e.target.value)}
      />
      <Input
        label="Подтвердите пароль"
        type={showConfirm ? "text" : "password"}
        placeholder="Повторите пароль"
        IconRight={showConfirm ? EyeIcon : EyeOffIcon}
        onIconRightClick={() => setShowConfirm((v) => !v)}
        value={data.confirmPassword}
        onChange={(e) => onChange("confirmPassword", e.target.value)}
        error={passwordError}
      />

      <div className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-overlay">
          Согласия и политики
        </span>
        <div className="rounded-xl border border-border divide-y divide-border">
          {(
            [
              {
                key: "agreeRules" as const,
                label: "Я согласен с правилами платформы",
              },
              {
                key: "agreePrivacy" as const,
                label: "Я согласен с политикой конфиденциальности",
              },
              {
                key: "agreeDataProcessing" as const,
                label: "Я даю согласие на обработку персональных данных",
              },
              {
                key: "agreeAccuracy" as const,
                label:
                  "Подтверждаю, что предоставленная информация соответствует действительности",
              },
            ] satisfies { key: keyof ClinicFormData; label: string }[]
          ).map(({ key, label }) => (
            <div key={key} className="px-4 py-3">
              <Checkbox
                label={label}
                checked={data[key] as boolean}
                onChange={(e) => onChange(key, e.target.checked)}
              />
            </div>
          ))}
        </div>
      </div>

      {verifySlot}

      <div className="flex gap-3 p-4 rounded-xl bg-background mt-2">
        <InfoIcon />
        <p className="text-sm text-muted">
          После регистрации вы получите доступ к личному кабинету клиники, где
          сможете управлять врачами, услугами и записями пациентов
        </p>
      </div>
    </div>
  );
};
