"use client";

import { FC, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { MobilePageHeader } from "@/widgets/profile-mobile-header";
import { ProfileReviews as ReviewsWidget } from "@/widgets/profile-reviews";
import { ProfileSidebar } from "@/widgets/profile-sidebar";

import type { ReviewType, UserReview } from "@/entities/user-review";

import { getProfileReviews } from "@/shared/api/profile/requests";
import { profileKeys } from "@/shared/api/queryKeys";
import {
  ClinicBuildingIcon,
  DoctorPersonIcon,
  ServiceRadialIcon,
} from "@/shared/assets";
import { FilterTabBar } from "@/shared/ui";

const TABS = [
  {
    id: "clinic" as ReviewType,
    label: "Клиники",
    icon: <ClinicBuildingIcon className="shrink-0" />,
  },
  {
    id: "doctor" as ReviewType,
    label: "Специалисты",
    icon: <DoctorPersonIcon className="shrink-0" />,
  },
  {
    id: "service" as ReviewType,
    label: "Услуги",
    icon: <ServiceRadialIcon className="shrink-0" />,
  },
];

export const ProfileReviewsPage: FC = () => {
  const [activeTab, setActiveTab] = useState<ReviewType>("clinic");

  const { data, isLoading } = useQuery({
    queryKey: profileKeys.reviews(),
    queryFn: getProfileReviews,
  });

  const reviews: UserReview[] = (data?.data ?? []).map((r) => ({
    id: String(r.id),
    type: r.target_type as ReviewType,
    rating: r.rating,
    comment: r.text ?? "",
    date: r.created_at.slice(0, 10),
  }));

  return (
    <>
      <MobilePageHeader title="Отзывы" />
      <div className="w-full max-w-360 mx-auto px-4 md:px-10 py-8">
        <h1 className="text-[40px] font-semibold text-foreground mb-8 hidden md:block">
          Мой профиль
        </h1>

        <div className="flex gap-6">
          <aside className="hidden lg:block shrink-0">
            <ProfileSidebar />
          </aside>

          <main className="flex-1 min-w-0">
            <h2 className="text-[28px] md:text-[32px] font-semibold text-foreground mb-6 hidden md:block">
              Отзывы
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
              <ReviewsWidget reviews={reviews} activeTab={activeTab} />
            )}
          </main>
        </div>
      </div>
    </>
  );
};
