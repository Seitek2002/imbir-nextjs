"use client";

import { FC, useState } from "react";

import { useParams } from "next/navigation";

import { ClinicSectionPage } from "@/widgets/clinic/section-page";

import { EducationSection, useSpecialistForm } from "../../../specialist-form";
import { useSpecialistDetail } from "../../useSpecialistDetail";

export const ClinicSpecialistEducationPage: FC = () => {
  const params = useParams<{ id: string }>() ?? { id: "" };
  const { specialist, initialForm, isLoading } = useSpecialistDetail(params.id);
  const [isEditing, setIsEditing] = useState(false);

  const { d, set, notifyNotConnected } = useSpecialistForm(initialForm);

  if (isLoading || !specialist) {
    return (
      <ClinicSectionPage
        title="Образование"
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
      title="Образование"
      isEditing={isEditing}
      onEditToggle={() => {
        if (isEditing) notifyNotConnected();
        setIsEditing((v) => !v);
      }}
    >
      <div className="bg-white rounded-3xl border border-border p-5">
        <EducationSection d={d} set={set} isEditing={isEditing} />
      </div>
    </ClinicSectionPage>
  );
};
