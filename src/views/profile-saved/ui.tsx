"use client";

import { FC, useState } from "react";

import { ProfileMobileHeader } from "@/widgets/profile-mobile-header";
import { ProfileSaved as SavedWidget } from "@/widgets/profile-saved";
import { ProfileSidebar } from "@/widgets/profile-sidebar";

import { MOCK_SAVED_ITEMS } from "@/entities/saved";
import type { SavedType } from "@/entities/saved";

import {
  ClinicBuildingIcon,
  DoctorPersonIcon,
  ServiceRadialIcon,
} from "@/shared/assets";
import { FilterTabBar } from "@/shared/ui";

const TABS = [
  {
    id: "clinic" as SavedType,
    label: "Клиники",
    icon: <ClinicBuildingIcon className="shrink-0" />,
  },
  {
    id: "doctor" as SavedType,
    label: "Специалисты",
    icon: <DoctorPersonIcon className="shrink-0" />,
  },
  {
    id: "service" as SavedType,
    label: "Услуги",
    icon: <ServiceRadialIcon className="shrink-0" />,
  },
];

export const ProfileSavedPage: FC = () => {
  const [activeTab, setActiveTab] = useState<SavedType>("clinic");

  return (
    <>
      <ProfileMobileHeader title="Сохранённое" />
      <div className="w-full max-w-360 mx-auto px-4 md:px-10 py-8">
        <h1 className="text-[40px] font-semibold text-[#191A1B] mb-8 hidden md:block">
          Мой профиль
        </h1>

        <div className="flex gap-6">
          <aside className="hidden lg:block shrink-0">
            <ProfileSidebar />
          </aside>

          <main className="flex-1 min-w-0">
            <h2 className="text-[28px] md:text-[32px] font-semibold text-[#191A1B] mb-6 hidden md:block">
              Сохранённое
            </h2>

            <FilterTabBar
              tabs={TABS}
              value={activeTab}
              onChange={setActiveTab}
              className="mb-6"
            />

            <SavedWidget items={MOCK_SAVED_ITEMS} activeTab={activeTab} />
          </main>
        </div>
      </div>
    </>
  );
};
