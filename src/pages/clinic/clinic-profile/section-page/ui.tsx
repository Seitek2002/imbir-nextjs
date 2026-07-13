"use client";

import { FC, ReactNode } from "react";

import { useRouter } from "next/navigation";

import { CheckIcon, EditIcon, HeaderBackIcon } from "@/shared/assets/icons";

type Props = {
  title: string;
  children: ReactNode;
  isEditing: boolean;
  onEditToggle: () => void;
  isSaving?: boolean;
};

// Мобильный экран одной секции «Моя клиника» (drill-down из хаба): шапка
// назад/заголовок/карандаш-галочка + контент. По аналогии с DoctorPageLayout,
// но без десктопного двухколоночного сайдбара — эти маршруты открываются
// только из мобильного хаба.
export const ClinicSectionPage: FC<Props> = ({
  title,
  children,
  isEditing,
  onEditToggle,
  isSaving,
}) => {
  const router = useRouter();

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA]">
      <div className="flex items-center justify-between px-4 py-4 bg-white border-b border-border">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-surface transition-colors"
          aria-label="Назад"
        >
          <HeaderBackIcon className="w-5 h-5" />
        </button>

        <h1 className="text-base font-semibold text-foreground truncate mx-2">
          {title}
        </h1>

        <button
          onClick={onEditToggle}
          disabled={isSaving}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors disabled:opacity-50 ${
            isEditing ? "text-primary" : "text-muted hover:bg-surface"
          }`}
          aria-label={isEditing ? "Сохранить" : "Редактировать"}
        >
          {isEditing ? (
            <CheckIcon className="w-5 h-5" />
          ) : (
            <EditIcon className="w-5 h-5" />
          )}
        </button>
      </div>

      <div className="max-w-360 mx-auto px-4 py-4">{children}</div>
    </div>
  );
};
