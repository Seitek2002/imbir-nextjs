"use client";

import { FC, useState } from "react";

import { IconBtn, SearchInput } from "@/shared";

import { ProfileMobileHeader } from "@/widgets/profile-mobile-header";
import { ProfileSaved as SavedWidget } from "@/widgets/profile-saved";
import { ProfileSidebar } from "@/widgets/profile-sidebar";

import { MOCK_SAVED_ITEMS } from "@/entities/saved";
import type { SavedType } from "@/entities/saved";

const TABS: { id: SavedType; label: string }[] = [
  { id: "clinic", label: "Клиники" },
  { id: "doctor", label: "Специалисты" },
  { id: "service", label: "Услуги" },
];

export const ProfileSavedPage: FC = () => {
  const [activeTab, setActiveTab] = useState<SavedType>("clinic");
  const [searchQuery, setSearchQuery] = useState("");

  const getTabIcon = (tabId: SavedType) => {
    switch (tabId) {
      case "clinic":
        return (
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0"
          >
            <path
              d="M3.33334 16.6667H16.6667M5.00001 16.6667V6.66667L10 3.33334L15 6.66667V16.6667M8.33334 16.6667V12.5C8.33334 12.0398 8.70644 11.6667 9.16668 11.6667H10.8333C11.2936 11.6667 11.6667 12.0398 11.6667 12.5V16.6667"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case "doctor":
        return (
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0"
          >
            <path
              d="M13.3333 5.83333C13.3333 7.67428 11.8409 9.16667 10 9.16667C8.15906 9.16667 6.66667 7.67428 6.66667 5.83333C6.66667 3.99238 8.15906 2.5 10 2.5C11.8409 2.5 13.3333 3.99238 13.3333 5.83333Z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M10 11.6667C6.77834 11.6667 4.16667 14.2783 4.16667 17.5H15.8333C15.8333 14.2783 13.2217 11.6667 10 11.6667Z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        );
      case "service":
        return (
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0"
          >
            <path
              d="M10 2.5V5.83333M10 14.1667V17.5M5.83333 10H2.5M17.5 10H14.1667M14.7487 14.7487L12.357 12.357M14.7487 5.25132L12.357 7.643M5.25132 14.7487L7.643 12.357M5.25132 5.25132L7.643 7.643"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        );
    }
  };

  return (
    <>
      <ProfileMobileHeader title="Сохранённое" />
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
                Сохранённое
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
                  {getTabIcon(tab.id)}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            <SavedWidget items={MOCK_SAVED_ITEMS} activeTab={activeTab} />
          </main>
        </div>
      </div>
    </>
  );
};
