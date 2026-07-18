"use client";

import { FC, ReactNode, useState } from "react";

import { useRouter } from "next/navigation";

import { CheckIcon, EditIcon, HeaderBackIcon } from "@/shared/assets/icons";
import { ConfirmDialog, IconBtn } from "@/shared/ui";

type Props = {
  title: string;
  children: ReactNode;
  isEditing: boolean;
  onEditToggle: () => void;
  isSaving?: boolean;
};

// Мобильный экран одной секции drill-down-профиля (клиника или специалист
// клиники): шапка назад/заголовок/карандаш-галочка + контент. По аналогии с
// DoctorPageLayout, но без десктопного двухколоночного сайдбара — эти
// маршруты открываются только из мобильного хаба.
export const ClinicSectionPage: FC<Props> = ({
  title,
  children,
  isEditing,
  onEditToggle,
  isSaving,
}) => {
  const router = useRouter();
  // onEditToggle — это handleSave, когда isEditing уже true (единая точка,
  // общая для всех 6 секций профиля клиники), поэтому подтверждение
  // достаточно перехватить здесь один раз, а не в каждой странице-секции.
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  const handleHeaderAction = () => {
    if (isEditing) {
      setShowSaveConfirm(true);
      return;
    }
    onEditToggle();
  };

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA]">
      <div className="flex items-center justify-between px-4 py-4 bg-white border-b border-border">
        <IconBtn
          onClick={() => router.back()}
          variant="text"
          size="sm"
          aria-label="Назад"
        >
          <HeaderBackIcon className="w-5 h-5" />
        </IconBtn>

        <h1 className="text-base font-semibold text-foreground truncate mx-2">
          {title}
        </h1>

        <IconBtn
          onClick={handleHeaderAction}
          disabled={isSaving}
          variant="text"
          size="sm"
          className={isEditing ? "text-primary" : "text-muted"}
          aria-label={isEditing ? "Сохранить" : "Редактировать"}
        >
          {isEditing ? (
            <CheckIcon className="w-5 h-5" />
          ) : (
            <EditIcon className="w-5 h-5" />
          )}
        </IconBtn>
      </div>

      <div className="max-w-360 mx-auto px-4 py-4">{children}</div>

      <ConfirmDialog
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={onEditToggle}
        icon={<CheckIcon className="w-7 h-7 text-primary" />}
        title="Сохранить изменения?"
        description="Обновлённые данные будут сохранены в профиле клиники"
        confirmLabel="Сохранить"
        cancelLabel="Отмена"
      />
    </div>
  );
};
