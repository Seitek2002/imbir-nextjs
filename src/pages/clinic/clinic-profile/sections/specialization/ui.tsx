"use client";

import { FC, useState } from "react";
import toast from "react-hot-toast";

import { ClinicSectionPage } from "@/widgets/clinic/section-page";

import { FieldRow, csv, useClinicCabinet } from "@/entities/clinic-profile";
import {
  resolveSpecializationIds,
  useSpecializations,
} from "@/entities/specialization";

import { Textarea } from "@/shared/ui";

export const ClinicSpecializationPage: FC = () => {
  const { profile, isLoading, isSaving, saveProfile } = useClinicCabinet();
  const [isEditing, setIsEditing] = useState(false);

  const [mainDirections, setMainDirections] = useState("");
  const [narrowDirections, setNarrowDirections] = useState("");
  const [additionalServices, setAdditionalServices] = useState("");

  // Поле — свободный текст, а бэк на запись принимает только id справочника
  // (см. resolveSpecializationIds). Название, которого нет в справочнике
  // (опечатка, устаревшее значение), не находит id и было бы молча потеряно —
  // предупреждаем об этом тостом вместо тихой потери данных.
  const { data: specializationList = [] } = useSpecializations();

  const [synced, setSynced] = useState<typeof profile>(null);
  if (profile && profile !== synced) {
    setSynced(profile);
    setMainDirections(profile.mainDirections.join(", "));
    setNarrowDirections(profile.narrowDirections.join(", "));
    setAdditionalServices(profile.additionalServices.join(", "));
  }

  const handleSave = async () => {
    const primary = resolveSpecializationIds(
      csv(mainDirections),
      specializationList,
    );
    const narrow = resolveSpecializationIds(
      csv(narrowDirections),
      specializationList,
    );
    const unmatched = [...primary.unmatched, ...narrow.unmatched];
    if (unmatched.length > 0) {
      toast.error(
        `Не найдено в справочнике и не сохранено: ${unmatched.join(", ")}`,
      );
    }

    await saveProfile({
      primary_specialization_ids: primary.ids,
      narrow_specialization_ids: narrow.ids,
      additional_services: additionalServices,
    });
    setIsEditing(false);
  };

  if (isLoading || !profile) {
    return (
      <ClinicSectionPage
        title="Специализация и услуги"
        isEditing={false}
        onEditToggle={() => {}}
      >
        <div className="flex items-center justify-center py-20 text-muted">
          Загрузка...
        </div>
      </ClinicSectionPage>
    );
  }

  return (
    <ClinicSectionPage
      title="Специализация и услуги"
      isEditing={isEditing}
      isSaving={isSaving}
      onEditToggle={() => (isEditing ? handleSave() : setIsEditing(true))}
    >
      <div className="bg-white rounded-3xl border border-border p-5">
        {isEditing ? (
          <div className="flex flex-col gap-6">
            <Textarea
              label="Основные направления"
              value={mainDirections}
              onChange={(e) => setMainDirections(e.target.value)}
              rows={3}
              placeholder="Терапия, Кардиология, Педиатрия..."
            />
            <Textarea
              label="Узкие направления"
              value={narrowDirections}
              onChange={(e) => setNarrowDirections(e.target.value)}
              rows={3}
              placeholder="Эндокринолог, Невролог, Офтальмолог..."
            />
            <Textarea
              label="Дополнительные услуги"
              value={additionalServices}
              onChange={(e) => setAdditionalServices(e.target.value)}
              rows={3}
              placeholder="Анализы, УЗИ, Рентген..."
            />
          </div>
        ) : (
          <div>
            <FieldRow label="Основные направления">
              {profile.mainDirections.join(", ")}
            </FieldRow>
            <FieldRow label="Узкие направления">
              {profile.narrowDirections.join(", ")}
            </FieldRow>
            <FieldRow label="Дополнительные услуги">
              {profile.additionalServices.join(", ")}
            </FieldRow>
          </div>
        )}
      </div>
    </ClinicSectionPage>
  );
};
