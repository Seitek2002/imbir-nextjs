"use client";

import { FC, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { MobilePageHeader } from "@/widgets/profile/mobile-header";

import { getFavorites, profileKeys } from "@/shared/api";
import {
  ClinicBuildingIcon,
  DoctorPersonIcon,
  ServiceRadialIcon,
} from "@/shared/assets/icons";
import { FilterTabBar } from "@/shared/ui";

import { ProfileSaved } from "./ProfileSaved/ui";
import { SavedItem, SavedType } from "./model";

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

  const { data: favorites, isLoading } = useQuery({
    queryKey: profileKeys.favorites(),
    queryFn: getFavorites,
  });

  // Раскладываем три группы ответа в один плоский список — данные карточек уже
  // пришли вместе с избранным, дочитывать врача/клинику/услугу не нужно.
  const savedItems: SavedItem[] = [
    ...(favorites?.doctors ?? []).map((data) => ({
      type: "doctor" as const,
      data,
    })),
    ...(favorites?.clinics ?? []).map((data) => ({
      type: "clinic" as const,
      data,
    })),
    ...(favorites?.services ?? []).map((data) => ({
      type: "service" as const,
      data,
    })),
  ];

  return (
    <>
      <MobilePageHeader
        title="Сохранённое"
        bottomElement={
          <div className="rounded-full bg-background p-1 overflow-hidden">
            <FilterTabBar
              tabs={TABS}
              value={activeTab}
              onChange={setActiveTab}
              className="pb-0"
            />
          </div>
        }
      />
      <div className="px-4 pt-6 pb-8 md:p-0">
        <h2 className="text-[28px] md:text-[32px] font-semibold text-foreground mb-6 hidden md:block">
          Сохранённое
        </h2>

        <div className="hidden md:block mb-6">
          <FilterTabBar tabs={TABS} value={activeTab} onChange={setActiveTab} />
        </div>

        {isLoading ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-border text-muted">
            Загрузка...
          </div>
        ) : (
          <ProfileSaved items={savedItems} activeTab={activeTab} />
        )}
      </div>
    </>
  );
};
