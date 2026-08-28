"use client";

import { FC, ReactNode } from "react";

import { useRouter } from "next/navigation";

import { CheckIcon, EditIcon, HeaderBackIcon } from "@/shared/assets/icons";
import { CancelEditIconButton, IconBtn } from "@/shared/ui";

type Props = {
  children: ReactNode;
  /**
   * editAction — рендерит стандартную кнопку карандаш/галочку.
   * headerRight — произвольный узел (для нестандартных кнопок, например «+»).
   * Передавать что-то одно.
   */
  editAction?: "edit" | "save";
  headerRight?: ReactNode;
  /**
   * onBack — что делает стрелка «назад» в мобильной шапке. По умолчанию
   * router.back(); экраны-разделы кабинета передают свой обработчик, чтобы
   * вернуться на предыдущий шаг внутри страницы (например, из раздела
   * «Моих данных» — к списку разделов), а не уйти из кабинета.
   */
  onBack?: () => void;
  /**
   * onCancel — выход из правки без сохранения. Рисует крестик слева от
   * галочки: раньше на телефоне отменить можно было только стрелкой «назад»,
   * и о том, что она отменяет, а не уводит со страницы, догадаться было
   * нельзя. На десктопе для этого есть отдельная кнопка «Отмена».
   */
  onCancel?: () => void;
  onEditToggle?: () => void;
  title: string;
};

export const DoctorPageLayout: FC<Props> = ({
  title,
  children,
  editAction,
  onEditToggle,
  onCancel,
  headerRight,
  onBack,
}) => {
  const router = useRouter();

  const rightSlot =
    headerRight ??
    (editAction ? (
      <div className="flex items-center gap-1">
        {editAction === "save" && onCancel && (
          <CancelEditIconButton onClick={onCancel} />
        )}
        <IconBtn
          onClick={onEditToggle}
          variant="text"
          size="sm"
          className={editAction === "save" ? "text-primary" : "text-muted"}
          aria-label={editAction === "save" ? "Сохранить" : "Редактировать"}
        >
          {editAction === "save" ? (
            <CheckIcon className="w-5 h-5" />
          ) : (
            <EditIcon className="w-5 h-5" />
          )}
        </IconBtn>
      </div>
    ) : (
      <div className="w-10" />
    ));

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between px-4 py-4 bg-white border-b border-border">
        <IconBtn
          onClick={onBack ?? (() => router.back())}
          variant="text"
          size="sm"
          aria-label="Назад"
        >
          <HeaderBackIcon className="w-5 h-5" />
        </IconBtn>

        <h1 className="text-base font-semibold text-foreground truncate mx-2">
          {title}
        </h1>

        {rightSlot}
      </div>

      {/* Контент страницы — на всех ширинах. Мобильные отступы даёт эта
          обёртка (как в ClinicPageLayout): каркас кабинета
          DoctorPageLayoutSkeleton держит края чистыми, чтобы шапка выше шла
          во всю ширину экрана. */}
      <div className="px-4 py-4 lg:p-0">{children}</div>
    </>
  );
};
