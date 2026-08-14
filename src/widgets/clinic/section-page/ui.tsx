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

  // isSaving передают только реально сохраняющие на бэке секции (профиль
  // клиники) — там onEditToggle запускает настоящий PUT-запрос, и пока он не
  // ответил, гасим диалог спиннером и закрываем его сами по завершении
  // (успех или ошибка — тост об ошибке показывает сама секция). У секций
  // специалиста onEditToggle синхронный (ещё не подключено к бэку), isSaving
  // не передаётся — для них сохраняем старое поведение: диалог закрывается
  // сразу по клику.
  const isAsyncSave = isSaving !== undefined;

  // Закрываем диалог, когда isSaving переходит true → false (сохранение
  // завершилось, успешно или с ошибкой) — без useEffect, подстройкой state
  // прямо во время рендера (тот же приём, что и в forgot-password/ui.tsx).
  const [wasSaving, setWasSaving] = useState(false);
  const isSavingNow = !!isSaving;
  if (isSavingNow !== wasSaving) {
    if (wasSaving && !isSavingNow) setShowSaveConfirm(false);
    setWasSaving(isSavingNow);
  }

  const handleHeaderAction = () => {
    if (isEditing) {
      setShowSaveConfirm(true);
      return;
    }
    onEditToggle();
  };

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA]">
      <div className="bg-white px-4 pt-1 pb-4">
        <div className="grid grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center min-h-10">
          <IconBtn
            onClick={() => router.back()}
            variant="outline"
            size="sm"
            className="justify-self-start"
            aria-label="Назад"
          >
            <HeaderBackIcon className="size-4" />
          </IconBtn>

          <h1 className="text-center font-medium text-base text-foreground truncate px-2">
            {title}
          </h1>

          <IconBtn
            onClick={handleHeaderAction}
            disabled={isSaving}
            variant="text"
            size="sm"
            className="justify-self-end"
            aria-label={isEditing ? "Сохранить" : "Редактировать"}
          >
            {isEditing ? (
              <CheckIcon className="size-4" />
            ) : (
              <EditIcon className="size-4" />
            )}
          </IconBtn>
        </div>
      </div>

      <div className="max-w-360 mx-auto px-4 pt-4 pb-6">{children}</div>

      <ConfirmDialog
        isOpen={showSaveConfirm}
        onClose={() => setShowSaveConfirm(false)}
        onConfirm={onEditToggle}
        icon={<CheckIcon className="w-7 h-7 text-primary" />}
        title="Сохранить изменения?"
        description="Обновлённые данные будут сохранены в профиле клиники"
        confirmLabel="Сохранить"
        cancelLabel="Отмена"
        isLoading={isAsyncSave ? isSaving : false}
        closeOnConfirm={!isAsyncSave}
      />
    </div>
  );
};
