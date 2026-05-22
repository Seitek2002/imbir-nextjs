"use client";

import { FC, ReactNode } from "react";

import { useRouter } from "next/navigation";

import { DoctorSidebar } from "@/widgets/doctor-sidebar";

import { MOCK_DOCTOR_PROFILE } from "@/entities/doctor-profile";

import { CheckIcon, EditIcon, HeaderBackIcon } from "@/shared/assets";

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

const d = MOCK_DOCTOR_PROFILE;

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
          editAction === "save"
            ? "text-[#F5653E]"
            : "text-[#838A8D] hover:bg-[#F8F9FA]"
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
    <div className="w-full min-h-screen bg-[#FAFAFA]">
      {/* Mobile header */}
      <div className="lg:hidden flex items-center justify-between px-4 py-4 bg-white border-b border-[#E5E6E8]">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-[#F8F9FA] transition-colors"
          aria-label="Назад"
        >
          <HeaderBackIcon className="w-5 h-5" />
        </button>

        <h1 className="text-base font-semibold text-[#191A1B] truncate mx-2">
          {title}
        </h1>

        {rightSlot}
      </div>

      {/* Desktop layout */}
      <div className="max-w-360 mx-auto px-4 lg:px-10 py-4 lg:py-8">
        <h1 className="text-[40px] font-semibold text-[#191A1B] mb-8 hidden lg:block">
          Мой профиль
        </h1>

        <div className="flex gap-6">
          <div className="hidden lg:block">
            <DoctorSidebar
              fullName={d.fullName}
              photo={d.photo}
              specialty={d.specialty}
              rating={d.rating}
            />
          </div>

          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
};
