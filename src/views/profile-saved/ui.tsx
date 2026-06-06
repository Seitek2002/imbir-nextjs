"use client";

import { FC, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { MobilePageHeader } from "@/widgets/profile-mobile-header";
import { ProfileSaved as SavedWidget } from "@/widgets/profile-saved";
import { ProfileSidebar } from "@/widgets/profile-sidebar";

import type { SavedItem, SavedType } from "@/entities/saved";

import { getFavorites } from "@/shared/api/profile/requests";
import { profileKeys } from "@/shared/api/queryKeys";
import { api } from "@/shared/api/requests";
import { getServiceById } from "@/shared/api/services/requests";
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

const emptySchedule = {
  mon: null,
  tue: null,
  wed: null,
  thu: null,
  fri: null,
  sat: null,
  sun: null,
  lunchBreak: null,
};

export const ProfileSavedPage: FC = () => {
  const [activeTab, setActiveTab] = useState<SavedType>("clinic");

  const { data: favorites } = useQuery({
    queryKey: profileKeys.favorites(),
    queryFn: getFavorites,
  });

  const { data: savedItems = [], isLoading } = useQuery({
    queryKey: [
      "saved-items",
      (favorites ?? []).map((f) => `${f.target_type}-${f.target_id}`).join(","),
    ],
    queryFn: async (): Promise<SavedItem[]> => {
      if (!favorites || favorites.length === 0) return [];
      const results = await Promise.all(
        favorites.map(async (fav) => {
          try {
            if (fav.target_type === "doctor") {
              const data = await api.getDoctorById(String(fav.target_id));
              if (!data) return null;
              return {
                id: String(fav.id),
                type: "doctor" as const,
                savedAt: fav.created_at,
                data,
              };
            }
            if (fav.target_type === "clinic") {
              const data = await api.getClinicById(String(fav.target_id));
              if (!data) return null;
              return {
                id: String(fav.id),
                type: "clinic" as const,
                savedAt: fav.created_at,
                data,
              };
            }
            if (fav.target_type === "service") {
              const s = await getServiceById(fav.target_id);
              const data = {
                id: String(s.id),
                clinicId: "",
                clinicName: "",
                name: s.name,
                category: s.category,
                price:
                  typeof s.price === "string" ? parseFloat(s.price) || 0 : 0,
                image: "",
                schedule: emptySchedule,
                doctorIds: [],
                rating: 0,
                reviews: 0,
              };
              return {
                id: String(fav.id),
                type: "service" as const,
                savedAt: fav.created_at,
                data,
              };
            }
          } catch {
            return null;
          }
          return null;
        }),
      );
      return results.filter(Boolean) as SavedItem[];
    },
    enabled: !!favorites,
  });

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

            {isLoading ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-[#E5E6E8] text-[#838A8D]">
                Загрузка...
              </div>
            ) : (
              <SavedWidget items={savedItems} activeTab={activeTab} />
            )}
          </main>
        </div>
      </div>
    </>
  );
};
