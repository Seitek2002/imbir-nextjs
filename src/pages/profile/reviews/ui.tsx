"use client";

import { FC, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { MobilePageHeader } from "@/widgets/profile/mobile-header";

import { getMyReviews, profileKeys } from "@/shared/api";
import { ClinicBuildingIcon, DoctorPersonIcon } from "@/shared/assets/icons";
import { FilterTabBar } from "@/shared/ui";

import { ProfileReviews } from "./reviews/ui";
import { ReviewType, UserReview } from "./reviews/user-review/model";

// Вкладки «Услуги» здесь нет намеренно: бэк не принимает отзывы на услуги
// (ReviewTargetTypeEnum = ['doctor', 'clinic'], POST /api/reviews/ с
// target_type: "service" отвечает 400), поэтому наполниться она не могла —
// пользователь видел пустой список без объяснений. Вернуть вместе с
// поддержкой отзывов на услуги на стороне сервера.
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
];

const MONTHS = [
  "Января",
  "Февраля",
  "Марта",
  "Апреля",
  "Мая",
  "Июня",
  "Июля",
  "Августа",
  "Сентября",
  "Октября",
  "Ноября",
  "Декабря",
];

// "2025-11-20T..." → "20 Ноября, 2025" — формат из макета. Раньше показывали
// сырую дату из ответа ("2025-11-20").
const fmtReviewDate = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}, ${d.getFullYear()}`;
};

export const ProfileReviewsPage: FC = () => {
  const [activeTab, setActiveTab] = useState<ReviewType>("clinic");

  const { data, isLoading } = useQuery({
    queryKey: profileKeys.reviews(),
    queryFn: getMyReviews,
  });

  const reviews: UserReview[] = (data?.data ?? []).map((r) => {
    const type = r.target_type as ReviewType;
    // Врача бэк отдаёт как full_name, клинику — как name (два разных поля
    // для одного и того же "на кого отзыв", проверено живым запросом).
    const targetName =
      typeof r.target === "string"
        ? r.target
        : (r.target?.name ?? r.target?.full_name ?? "");
    return {
      id: String(r.id),
      type,
      rating: r.rating,
      comment: r.text ?? "",
      date: fmtReviewDate(r.created_at),
      reply: r.reply
        ? { text: r.reply.text, date: fmtReviewDate(r.reply.created_at) }
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
    <>
      <MobilePageHeader
        title="Отзывы"
        bottomElement={
          <FilterTabBar
            tabs={TABS}
            value={activeTab}
            onChange={setActiveTab}
            className="pb-0"
          />
        }
      />
      <div className="px-4 pt-6 pb-8 md:p-0">
        <h2 className="text-[28px] md:text-[32px] font-semibold text-foreground mb-6 hidden md:block">
          Отзывы
        </h2>

        <div className="hidden md:block mb-6">
          <FilterTabBar tabs={TABS} value={activeTab} onChange={setActiveTab} />
        </div>

        {isLoading ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-border text-muted">
            Загрузка...
          </div>
        ) : (
          <ProfileReviews reviews={reviews} activeTab={activeTab} />
        )}
      </div>
    </>
  );
};
