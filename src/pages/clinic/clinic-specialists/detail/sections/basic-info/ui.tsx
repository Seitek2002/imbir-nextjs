"use client";

import { FC, useState } from "react";

import { useParams } from "next/navigation";

import { ClinicSectionPage } from "@/widgets/clinic/section-page";

import { BasicInfoSection, useSpecialistForm } from "../../../specialist-form";
import { useSpecialistDetail } from "../../useSpecialistDetail";

export const ClinicSpecialistBasicInfoPage: FC = () => {
  const params = useParams<{ id: string }>() ?? { id: "" };
  const { specialist, initialForm, isLoading } = useSpecialistDetail(params.id);
  const [isEditing, setIsEditing] = useState(false);

  const { d, set, notifyNotConnected } = useSpecialistForm(initialForm);

  if (isLoading || !specialist) {
    return (
      <ClinicSectionPage
        title="Основная информация"
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
      title="Основная информация"
      isEditing={isEditing}
      onEditToggle={() => {
        if (isEditing) notifyNotConnected();
        setIsEditing((v) => !v);
      }}
    >
      <div className="bg-white rounded-3xl border border-border p-5">
        <BasicInfoSection d={d} set={set} isEditing={isEditing} />
      </div>
    </ClinicSectionPage>
  );
};
