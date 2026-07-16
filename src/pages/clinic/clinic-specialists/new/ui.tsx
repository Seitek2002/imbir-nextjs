"use client";

import { FC } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { ClinicPageLayout } from "@/widgets/clinic/layout";

import { Button } from "@/shared/ui";

import {
  BasicInfoSection,
  CertificatesSection,
  EducationSection,
  ProfessionalSection,
  SectionCard,
  useSpecialistForm,
} from "../specialist-form";

export const ClinicNewSpecialistPage: FC = () => {
  const router = useRouter();
  const { d, set, notifyNotConnected } = useSpecialistForm();

  const handleSave = () => {
    notifyNotConnected();
    router.push("/clinic-profile/specialists");
  };

  return (
    <ClinicPageLayout title="Добавить специалиста" desktopTitle="Мой профиль">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[28px] md:text-[32px] font-semibold text-foreground">
          Добавить специалиста
        </h2>
        <Button onClick={handleSave}>Сохранить</Button>
      </div>

      <div className="bg-primary-tint text-sm text-foreground rounded-2xl px-4 py-3 mb-6">
        Форма пока не подключена к бэкенду — специалисты реально добавляются по{" "}
        <Link
          href="/clinic-profile/invites"
          className="text-primary font-medium hover:underline"
        >
          пригласительной ссылке
        </Link>
        , он сам заполнит свой профиль после регистрации.
      </div>

      <SectionCard title="Основная информация">
        <BasicInfoSection d={d} set={set} isEditing />
      </SectionCard>
      <SectionCard title="Профессиональные данные">
        <ProfessionalSection d={d} set={set} isEditing />
      </SectionCard>
      <SectionCard title="Образование">
        <EducationSection d={d} set={set} isEditing />
      </SectionCard>
      <SectionCard title="Сертификаты и документы">
        <CertificatesSection d={d} set={set} isEditing />
      </SectionCard>
    </ClinicPageLayout>
  );
};
