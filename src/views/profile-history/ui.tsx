"use client";

import { FC, useState } from "react";

import { ProfileHistory as HistoryWidget } from "@/widgets/profile-history";
import { MobilePageHeader } from "@/widgets/profile-mobile-header";
import { ProfileSidebar } from "@/widgets/profile-sidebar";

import { MOCK_APPOINTMENTS } from "@/entities/appointment";

import { SegmentedControl } from "@/shared/ui/segmented-control";

const TABS = [
  { value: "upcoming" as const, label: "Предстоящие" },
  { value: "completed" as const, label: "Прошедшие" },
];

export const ProfileHistoryPage: FC = () => {
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed">(
    "upcoming",
  );

  return (
    <>
      <MobilePageHeader title="История записей" />
      <div className="w-full max-w-360 mx-auto px-4 md:px-10 py-8">
        <h1 className="text-[40px] font-semibold text-[#191A1B] mb-8 hidden md:block">
          Мой профиль
        </h1>

        <div className="flex gap-6">
          <aside className="hidden lg:block shrink-0">
            <ProfileSidebar />
          </aside>

          <main className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6 hidden md:flex">
              <h2 className="text-[28px] md:text-[32px] font-semibold text-[#191A1B]">
                История записей
              </h2>
            </div>

            {/* Mobile: segmented control */}
            <div className="md:hidden mb-6">
              <SegmentedControl
                options={TABS}
                value={activeTab}
                onChange={setActiveTab}
              />
            </div>

            {/* Desktop: border pills */}
            <div className="hidden md:flex gap-2 mb-6">
              {TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`px-6 py-2.5 rounded-full font-medium text-sm whitespace-nowrap transition-all border ${
                    activeTab === tab.value
                      ? "border-[#191A1B] text-[#191A1B] bg-white"
                      : "border-[#E5E6E8] text-[#838A8D] bg-white hover:border-[#C4C8CA]"
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
