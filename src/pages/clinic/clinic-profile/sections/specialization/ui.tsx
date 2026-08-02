"use client";

import { FC, useState } from "react";

import { ClinicSectionPage } from "@/widgets/clinic/section-page";

import { FieldRow, csv, useClinicCabinet } from "@/entities/clinic-profile";

import { Textarea } from "@/shared/ui";

export const ClinicSpecializationPage: FC = () => {
  const { profile, isLoading, isSaving, saveProfile } = useClinicCabinet();
  const [isEditing, setIsEditing] = useState(false);

  const [mainDirections, setMainDirections] = useState("");
  const [narrowDirections, setNarrowDirections] = useState("");
  const [additionalServices, setAdditionalServices] = useState("");

  const [synced, setSynced] = useState<typeof profile>(null);
  if (profile && profile !== synced) {
    setSynced(profile);
    setMainDirections(profile.mainDirections.join(", "));
    setNarrowDirections(profile.narrowDirections.join(", "));
    setAdditionalServices(profile.additionalServices.join(", "));
  }

  const handleSave = async () => {
    await saveProfile({
      primary_specializations: csv(mainDirections),
      narrow_specializations: csv(narrowDirections),
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
