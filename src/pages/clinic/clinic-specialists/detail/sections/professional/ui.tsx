"use client";

import { FC, useState } from "react";

import { useParams } from "next/navigation";

import { ClinicSectionPage } from "@/widgets/clinic/section-page";

import {
  ProfessionalSection,
  useSpecialistForm,
} from "../../../specialist-form";
import { useSpecialistDetail } from "../../useSpecialistDetail";

export const ClinicSpecialistProfessionalPage: FC = () => {
  const params = useParams<{ id: string }>() ?? { id: "" };
  const { specialist, initialForm, isLoading, saveMutation } =
    useSpecialistDetail(params.id);
  const [isEditing, setIsEditing] = useState(false);

  const { d, set, reset } = useSpecialistForm(initialForm);

  // Кнопка в шапке переключает просмотр/правку; при выходе из правки
  // отправляем карточку целиком (PATCH принимает частичное тело).
  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const handleToggle = async () => {
    if (!isEditing) return setIsEditing(true);
    try {
      await saveMutation.mutateAsync(d);
      setIsEditing(false);
    } catch {
      // Ошибка уже показана тостом — остаёмся в правке.
    }
  };

  if (isLoading || !specialist) {
    return (
      <ClinicSectionPage
        title="Профессиональные данные"
        isEditing={false}
        onEditToggle={() => {}}
      >
        <div className="flex items-center justify-center py-20 text-muted">
          {isLoading ? "Загрузка..." : "Специалист не найден"}
        </div>
      </ClinicSectionPage>
    );
  }

  return (
    <ClinicSectionPage
      title="Профессиональные данные"
      isEditing={isEditing}
      onCancel={handleCancel}
      onEditToggle={handleToggle}
    >
      <div className="bg-white rounded-3xl border border-border p-5">
        <ProfessionalSection d={d} set={set} isEditing={isEditing} />
      </div>
    </ClinicSectionPage>
  );
};
