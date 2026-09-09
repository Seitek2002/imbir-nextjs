"use client";

import { FC } from "react";

import { FieldView } from "@/widgets/doctor/layout";

import { Checkbox, Input } from "@/shared/ui";

type OnlineProfileSettingsProps = {
  consultationPrice: string;
  isEditing: boolean;
  isOnlineAvailable: boolean;
  isPublished: boolean;
  onConsultationPriceChange: (value: string) => void;
  onOnlineAvailableChange: (value: boolean) => void;
  onPublishedChange: (value: boolean) => void;
  readOnlyClassName?: string;
};

export const OnlineProfileSettings: FC<OnlineProfileSettingsProps> = ({
  consultationPrice,
  isEditing,
  isOnlineAvailable,
  isPublished,
  onConsultationPriceChange,
  onOnlineAvailableChange,
  onPublishedChange,
  readOnlyClassName = "flex flex-col gap-4",
}) => (
  <div className="mt-6 pt-6 border-t border-border order-last lg:order-none">
    <h3 className="text-base font-semibold text-foreground mb-4">
      Онлайн-приём и публикация
    </h3>

    {isEditing ? (
      <div className="flex flex-col gap-4">
        <Checkbox
          size="large"
          label="Принимаю онлайн (видеоконсультации)"
          checked={isOnlineAvailable}
          onChange={(e) => onOnlineAvailableChange(e.target.checked)}
        />
        <div className="max-w-xs">
          <Input
            label="Стоимость консультации, сом"
            type="number"
            min="0"
            step="1"
            value={consultationPrice}
            onChange={(e) => onConsultationPriceChange(e.target.value)}
            placeholder="0"
            disabled={!isOnlineAvailable}
          />
        </div>
        <Checkbox
          size="large"
          label="Опубликовать профиль в каталоге"
          checked={isPublished}
          onChange={(e) => onPublishedChange(e.target.checked)}
        />
        <p className="text-muted text-sm">
          Пока профиль не опубликован, он не показывается в поиске и на него
          нельзя записаться.
        </p>
      </div>
    ) : (
      <div className={readOnlyClassName}>
        <FieldView
          label="Приём онлайн"
          value={isOnlineAvailable ? "Включён" : "Отключён"}
        />
        <FieldView
          label="Стоимость консультации, сом"
          value={consultationPrice}
        />
        <FieldView
          label="Профиль в каталоге"
          value={isPublished ? "Опубликован" : "Не опубликован"}
        />
      </div>
    )}
  </div>
);
