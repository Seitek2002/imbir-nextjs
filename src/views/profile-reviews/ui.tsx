"use client";

import { FC, useState } from "react";

import { IconBtn, SearchInput } from "@/shared";

import { ProfileMobileHeader } from "@/widgets/profile-mobile-header";
import { ProfileReviews as ReviewsWidget } from "@/widgets/profile-reviews";
import { ProfileSidebar } from "@/widgets/profile-sidebar";

import { MOCK_USER_REVIEWS } from "@/entities/user-review";
import type { ReviewType } from "@/entities/user-review";

const TABS: { id: ReviewType; label: string; icon: string }[] = [
  { id: "clinic", label: "Клиники", icon: "🏥" },
  { id: "doctor", label: "Специалисты", icon: "👨‍⚕️" },
  { id: "service", label: "Услуги", icon: "💼" },
];

export const ProfileReviewsPage: FC = () => {
  const [activeTab, setActiveTab] = useState<ReviewType>("clinic");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <>
      <ProfileMobileHeader title="История записей" />
      <div className="w-full max-w-360 mx-auto px-4 md:px-10 py-8">
        <h1 className="text-[40px] font-semibold text-[#191A1B] mb-8 hidden md:block">
          Мой профиль
        </h1>

        <div className="flex gap-6">
          <aside className="hidden lg:block shrink-0">
            <ProfileSidebar />
          </aside>

          <main className="flex-1 min-w-0">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <h2 className="text-[28px] md:text-[32px] font-semibold text-[#191A1B]">
                Отзывы
              </h2>

              <div className="flex items-center gap-3">
                <div className="flex-1 md:flex-initial">
                  <SearchInput value={searchQuery} onChange={setSearchQuery} />
                </div>
                <IconBtn variant="outline" className="w-12 h-12 shrink-0">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2.5 5.83333H17.5M5.83333 10H14.1667M8.33333 14.1667H11.6667"
                      stroke="#686F72"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </IconBtn>
              </div>
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-3 rounded-full font-medium text-base whitespace-nowrap transition-all flex items-center gap-2 ${
                    activeTab === tab.id
                      ? "bg-[#F5653E] text-white shadow-sm"
                      : "bg-[#F2F4F7] text-[#686F72] hover:bg-[#E5E6E8]"
                  }`}
                >
                  <span className="text-lg leading-none">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <ReviewsWidget reviews={MOCK_USER_REVIEWS} activeTab={activeTab} />
          </main>
        </div>
      </div>
    </>
  );
};
