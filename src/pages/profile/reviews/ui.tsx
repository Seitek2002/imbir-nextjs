"use client";

import { FC, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { MobilePageHeader } from "@/widgets/profile/mobile-header";
import { ProfileSidebar } from "@/widgets/profile/sidebar";

import { getMyReviews, profileKeys } from "@/shared/api";
import {
  ClinicBuildingIcon,
  DoctorPersonIcon,
  ServiceRadialIcon,
} from "@/shared/assets/icons";
import { CabinetShell, FilterTabBar } from "@/shared/ui";

import { ProfileReviews } from "./reviews/ui";
import { ReviewType, UserReview } from "./reviews/user-review/model";

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
    queryFn: getMyReviews,
  });

  const reviews: UserReview[] = (data?.data ?? []).map((r) => {
    const type = r.target_type as ReviewType;
    const targetName = r.target?.full_name ?? "";
    return {
      id: String(r.id),
      type,
      rating: r.rating,
      comment: r.text ?? "",
      date: r.created_at.slice(0, 10),
      reply: r.reply
        ? { text: r.reply.text, date: r.reply.created_at.slice(0, 10) }
        : null,
      // /api/profile/reviews/ отдаёт только target.full_name — раскладываем
      // его в поле, которое рендерит карточка для этого типа.
      ...(type === "clinic"
        ? { clinicName: targetName }
        : type === "service"
          ? { serviceName: targetName }
          : { doctorName: targetName }),
    };
  });

  return (
    <CabinetShell
      title="Мой профиль"
      mobileHeader={<MobilePageHeader title="Отзывы" />}
      sidebar={<ProfileSidebar />}
    >
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
        <ProfileReviews reviews={reviews} activeTab={activeTab} />
      )}
    </CabinetShell>
  );
};
