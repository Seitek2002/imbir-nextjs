"use client";

import { FC, useState } from "react";
import toast from "react-hot-toast";

import { ClinicSectionPage } from "@/widgets/clinic/section-page";

import { FieldRow, useClinicCabinet } from "@/entities/clinic-profile";
import {
  resolveSpecializationIds,
  useSpecializationOptions,
  useSpecializations,
} from "@/entities/specialization";

import { Dropdown, Textarea } from "@/shared/ui";

export const ClinicSpecializationPage: FC = () => {
  const { profile, isLoading, isSaving, saveProfile } = useClinicCabinet();
  const [isEditing, setIsEditing] = useState(false);

  const [mainDirections, setMainDirections] = useState<string[]>([]);
  const [narrowDirections, setNarrowDirections] = useState<string[]>([]);
  const [additionalServices, setAdditionalServices] = useState("");

  // Бэк на запись принимает только id справочника (см. resolveSpecializationIds),
  // поэтому направления выбираются из списка, а не вводятся текстом. Тост про
  // ненайденные названия оставлен страховкой: если у клиники сохранено значение,
  // которого уже нет в справочнике, оно должно быть замечено, а не исчезнуть.
  const { data: specializationList = [] } = useSpecializations();
  const { options: specializationOptions, isLoading: isSpecsLoading } =
    useSpecializationOptions();
  const specializationPlaceholder = isSpecsLoading
    ? "Загружаем список..."
    : "Выберите из списка";

  const [synced, setSynced] = useState<typeof profile>(null);
  if (profile && profile !== synced) {
    setSynced(profile);
    setMainDirections(profile.mainDirections);
    setNarrowDirections(profile.narrowDirections);
    setAdditionalServices(profile.additionalServices.join(", "));
  }

  const handleSave = async () => {
    const primary = resolveSpecializationIds(
      mainDirections,
      specializationList,
    );
    const narrow = resolveSpecializationIds(
      narrowDirections,
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
            <Dropdown
              label="Основные направления"
              placeholder={specializationPlaceholder}
              options={specializationOptions}
              isMulti
              searchable
              showSelectAll
              selectAllMode="select"
              value={mainDirections}
              onChange={setMainDirections}
            />
            <Dropdown
              label="Узкие направления"
              placeholder={specializationPlaceholder}
              options={specializationOptions}
              isMulti
              searchable
              showSelectAll
              selectAllMode="select"
              value={narrowDirections}
              onChange={setNarrowDirections}
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
