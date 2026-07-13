"use client";

import { FC, ReactNode } from "react";

import { useRouter } from "next/navigation";

import { CheckIcon, EditIcon, HeaderBackIcon } from "@/shared/assets/icons";

type Props = {
  title: string;
  children: ReactNode;
  /**
   * editAction — рендерит стандартную кнопку карандаш/галочку.
   * headerRight — произвольный узел (для нестандартных кнопок, например «+»).
   * Передавать что-то одно.
   */
  editAction?: "edit" | "save";
  onEditToggle?: () => void;
  headerRight?: ReactNode;
};

export const DoctorPageLayout: FC<Props> = ({
  title,
  children,
  editAction,
  onEditToggle,
  headerRight,
}) => {
  const router = useRouter();

  const rightSlot =
    headerRight ??
    (editAction ? (
      <button
        onClick={onEditToggle}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
          editAction === "save" ? "text-primary" : "text-muted hover:bg-surface"
        }`}
        aria-label={editAction === "save" ? "Сохранить" : "Редактировать"}
      >
        {editAction === "save" ? (
          <CheckIcon className="w-5 h-5" />
        ) : (
          <EditIcon className="w-5 h-5" />
        )}
      </button>
    ) : (
      <div className="w-10" />
    ));

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between px-4 py-4 bg-white border-b border-border">
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

        {rightSlot}
      </div>

      {/* Desktop layout page content */}
      <div className="hidden lg:block">{children}</div>
    </>
  );
};
