"use client";

import { FC, useState } from "react";

import { useParams } from "next/navigation";

import { ClinicSectionPage } from "@/widgets/clinic/section-page";

import {
  CertificatesSection,
  useSpecialistForm,
} from "../../../specialist-form";
import { useSpecialistDetail } from "../../useSpecialistDetail";

export const ClinicSpecialistCertificatesPage: FC = () => {
  const params = useParams<{ id: string }>() ?? { id: "" };
  const {
    specialist,
    initialForm,
    isLoading,
    saveMutation,
    documents,
    uploadDocument,
    deleteDocument,
    isUploadingDocument,
  } = useSpecialistDetail(params.id);
  const [isEditing, setIsEditing] = useState(false);

  const { d, set } = useSpecialistForm(initialForm);

  // Кнопка в шапке переключает просмотр/правку; при выходе из правки
  // отправляем карточку целиком (PATCH принимает частичное тело).
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
        title="Сертификаты и документы"
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
      title="Сертификаты и документы"
      isEditing={isEditing}
      onEditToggle={handleToggle}
    >
      <div className="bg-white rounded-3xl border border-border p-5">
        <CertificatesSection
          d={d}
          set={set}
          isEditing={isEditing}
          documents={documents}
          onUpload={uploadDocument}
          onDelete={deleteDocument}
          isUploading={isUploadingDocument}
        />
      </div>
    </ClinicSectionPage>
  );
};
