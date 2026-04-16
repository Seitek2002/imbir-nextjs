"use client";

import { FC, useState } from "react";

import { ProfileHistory as HistoryWidget } from "@/widgets/profile-history";
import { ProfileMobileHeader } from "@/widgets/profile-mobile-header";
import { ProfileSidebar } from "@/widgets/profile-sidebar";

import { MOCK_APPOINTMENTS } from "@/entities/appointment";

import { SearchIcon } from "@/shared/assets";

const TABS = [
  { id: "upcoming" as const, label: "Предстоящие" },
  { id: "completed" as const, label: "Прошедшие" },
];

export const ProfileHistoryPage: FC = () => {
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed">(
    "upcoming",
  );
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
                История записей
              </h2>

              <div className="flex items-center gap-3">
                <div className="relative flex-1 md:flex-initial">
                  <input
                    type="text"
                    placeholder="Поиск"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full md:w-60 h-12 pl-12 pr-4 rounded-full bg-white border border-[#E5E6E8] text-[#191A1B] placeholder:text-[#C4C8CA] focus:outline-none focus:border-[#F5653E] transition-colors"
                  />
                  <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#838A8D] [&_path]:stroke-[#838A8D]" />
                </div>
                <button className="w-12 h-12 rounded-full bg-white border border-[#E5E6E8] flex items-center justify-center hover:bg-[#F8F9FA] transition-colors shrink-0">
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
                </button>
              </div>
            </div>

            <div className="flex gap-2 mb-6">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 rounded-full font-medium text-base whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? "bg-[#F5653E] text-white shadow-sm"
                      : "bg-[#F2F4F7] text-[#686F72] hover:bg-[#E5E6E8]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <HistoryWidget
              appointments={MOCK_APPOINTMENTS}
              activeTab={activeTab}
            />
          </main>
        </div>
      </div>
    </>
  );
};
