"use client";

import { FC, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { MobilePageHeader } from "@/widgets/profile-mobile-header";
import { ProfileSidebar } from "@/widgets/profile-sidebar";

import type { SavedType } from "@/entities/saved";

import { getFavorites } from "@/shared/api/profile/requests";
import { profileKeys } from "@/shared/api/queryKeys";
import {
  ClinicBuildingIcon,
  DoctorPersonIcon,
  ServiceRadialIcon,
} from "@/shared/assets";
import { useAuthStore } from "@/shared/store/authStore";
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
  const accessToken = useAuthStore((s) => s.accessToken);

  const { data: favorites = [] } = useQuery({
    queryKey: profileKeys.favorites(),
    queryFn: getFavorites,
    enabled: !!accessToken,
  });

  const filtered = favorites.filter(
    (f) =>
      f.target_type === activeTab ||
      (activeTab === "doctor" && f.target_type === "doctor"),
  );

  return (
    <>
      <MobilePageHeader title="Сохранённое" />
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

            {filtered.length === 0 ? (
              <div className="bg-white rounded-3xl p-10 text-center">
                <p className="text-[#838A8D] text-lg">Ничего не сохранено</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {filtered.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-2xl border border-[#E5E6E8] p-4 flex items-center justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#191A1B] truncate">
                        {typeof item.target === "string"
                          ? item.target
                          : `#${item.target_id}`}
                      </p>
                      <p className="text-xs text-[#838A8D] mt-0.5 capitalize">
                        {item.target_type}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
};
