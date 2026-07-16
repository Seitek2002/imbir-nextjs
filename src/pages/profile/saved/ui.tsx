"use client";

import { FC, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { MobilePageHeader } from "@/widgets/profile/mobile-header";

import { api, getFavorites, getServiceById, profileKeys } from "@/shared/api";
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
      <div className="px-4 py-8 md:p-0">
        <h2 className="text-[28px] md:text-[32px] font-semibold text-foreground mb-6 hidden md:block">
          Сохранённое
        </h2>

        <FilterTabBar
          tabs={TABS}
          value={activeTab}
          onChange={setActiveTab}
          className="mb-6"
        />

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
