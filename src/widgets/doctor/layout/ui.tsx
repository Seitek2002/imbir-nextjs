"use client";

import { FC, ReactNode } from "react";

import { useRouter } from "next/navigation";

import { CheckIcon, EditIcon, HeaderBackIcon } from "@/shared/assets/icons";
import { IconBtn } from "@/shared/ui";

import { useDoctorCabinet } from "./doctor-profile/useDoctorCabinet";
import { DoctorSidebar } from "./sidebar";

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
  const { profile } = useDoctorCabinet();

  const rightSlot =
    headerRight ??
    (editAction ? (
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
    ) : (
      <div className="w-10" />
    ));

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA]">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between px-4 py-4 bg-white border-b border-border">
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

        {rightSlot}
      </div>

      {/* Desktop layout */}
      <div className="max-w-360 mx-auto px-4 lg:px-10 py-4 lg:py-8">
        <h1 className="text-[40px] font-semibold text-foreground mb-8 hidden lg:block">
          Мой профиль
        </h1>

        <div className="flex gap-6">
          <div className="hidden lg:block">
            <DoctorSidebar
              fullName={profile?.fullName ?? ""}
              photo={profile?.photo}
              specialty={profile?.specialty ?? ""}
              rating={profile?.rating ?? 0}
            />
          </div>

          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
};
