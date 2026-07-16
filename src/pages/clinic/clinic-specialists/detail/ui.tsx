"use client";

import { FC, useState } from "react";

import Link from "next/link";
import { useParams } from "next/navigation";

import { ClinicPageLayout } from "@/widgets/clinic/layout";

import {
  ChevronRightIcon,
  EditIcon,
  TrashIcon,
  UserCircleIcon,
} from "@/shared/assets/icons";
import { Button, ConfirmDialog, IconBtn, ImageWithFallback } from "@/shared/ui";

import {
  BasicInfoSection,
  CertificatesSection,
  EducationSection,
  ProfessionalSection,
  SectionCard,
  useSpecialistForm,
} from "../specialist-form";
import { useSpecialistDetail } from "./useSpecialistDetail";

const HUB_ITEMS = [
  { key: "basic-info", label: "Основная информация" },
  { key: "professional", label: "Профессиональные данные" },
  { key: "education", label: "Образование" },
  { key: "certificates", label: "Сертификаты и документы" },
] as const;

export const ClinicSpecialistDetailPage: FC = () => {
  const params = useParams<{ id: string }>() ?? { id: "" };
  const id = params.id;
  const { specialist, isLoading, deleteMutation } = useSpecialistDetail(id);

  const [isEditing, setIsEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const { d, set, notifyNotConnected } = useSpecialistForm({
    fullName: specialist?.full_name ?? "",
    specialization: specialist?.specialty ?? "",
    photoPreview: specialist?.photo ?? undefined,
  });

  const handleSave = () => {
    notifyNotConnected();
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <ClinicPageLayout title="Специалист" desktopTitle="Мой профиль">
        <div className="flex items-center justify-center py-20 text-muted">
          Загрузка...
        </div>
      </ClinicPageLayout>
    );
  }

  if (!specialist) {
    return (
      <ClinicPageLayout title="Специалист" desktopTitle="Мой профиль">
        <div className="bg-white rounded-3xl border border-border px-6 py-16 text-center text-muted">
          Специалист не найден
        </div>
      </ClinicPageLayout>
    );
  }

  return (
    <>
      <ClinicPageLayout
        title=""
        desktopTitle="Мой профиль"
        mobileAction={
          <div className="flex items-center gap-1">
            <Link
              href={`/clinic-profile/specialists/${id}/basic-info`}
              className="w-10 h-10 rounded-full flex items-center justify-center text-muted hover:bg-surface transition-colors"
              aria-label="Редактировать"
            >
              <EditIcon className="w-5 h-5" />
            </Link>
            <IconBtn
              onClick={() => setDeleteOpen(true)}
              variant="text"
              size="sm"
              className="text-primary hover:bg-primary-tint"
              aria-label="Удалить"
            >
              <TrashIcon className="w-5 h-5" />
            </IconBtn>
          </div>
        }
      >
        {/* Десктоп: единая страница со всеми секциями (как «Моя клиника») */}
        <div className="hidden md:block">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[32px] font-semibold text-foreground">
              {specialist.full_name}
            </h2>
            <div className="flex items-center gap-3">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Отмена
                  </Button>
                  <Button onClick={handleSave}>Сохранить</Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    IconLeft={TrashIcon}
                    onClick={() => setDeleteOpen(true)}
                  >
                    Удалить
                  </Button>
                  <Button
                    variant="outline"
                    IconLeft={EditIcon}
                    onClick={() => setIsEditing(true)}
                  >
                    Редактировать
                  </Button>
                </>
              )}
            </div>
          </div>

          <SectionCard title="Основная информация">
            <BasicInfoSection d={d} set={set} isEditing={isEditing} />
          </SectionCard>
          <SectionCard title="Профессиональные данные">
            <ProfessionalSection d={d} set={set} isEditing={isEditing} />
          </SectionCard>
          <SectionCard title="Образование">
            <EducationSection d={d} set={set} isEditing={isEditing} />
          </SectionCard>
          <SectionCard title="Сертификаты и документы">
            <CertificatesSection d={d} set={set} isEditing={isEditing} />
          </SectionCard>
        </div>

        {/* Мобайл: карточка специалиста + хаб-список секций */}
        <div className="md:hidden">
          <div className="bg-white rounded-3xl border border-border overflow-hidden mb-4">
            <div className="relative w-full aspect-square bg-primary-tint">
              {specialist.photo ? (
                <ImageWithFallback
                  src={specialist.photo}
                  alt={specialist.full_name}
                  fill
                  className="object-cover object-top"
                  fallback={
                    <div className="w-full h-full flex items-center justify-center">
                      <UserCircleIcon className="size-20 text-dim" />
                    </div>
                  }
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <UserCircleIcon className="size-20 text-dim" />
                </div>
              )}
            </div>
            <div className="p-4 text-center">
              <h3 className="font-semibold text-lg text-foreground">
                {specialist.full_name}
              </h3>
              <p className="text-muted text-sm mt-0.5">
                {specialist.specialty}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-border overflow-hidden">
            {HUB_ITEMS.map((item, i) => (
              <Link
                key={item.key}
                href={`/clinic-profile/specialists/${id}/${item.key}`}
                className={`flex items-center gap-3 px-4 py-4 hover:bg-surface transition-colors ${
                  i !== HUB_ITEMS.length - 1 ? "border-b border-background" : ""
                }`}
              >
                <span className="flex-1 font-medium text-base text-foreground">
                  {item.label}
                </span>
                <ChevronRightIcon className="w-5 h-5 text-dim" />
              </Link>
            ))}
          </div>
        </div>
      </ClinicPageLayout>

      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          setDeleteOpen(false);
          deleteMutation.mutate();
        }}
        icon={<TrashIcon className="w-7 h-7" />}
        variant="danger"
        title="Открепить специалиста?"
        description={`«${specialist.full_name}» будет удалён из списка специалистов клиники без возможности восстановления`}
        confirmLabel="Открепить"
        cancelLabel="Отмена"
      />
    </>
  );
};
