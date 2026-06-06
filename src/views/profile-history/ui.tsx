"use client";

import { FC, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { ProfileHistory as HistoryWidget } from "@/widgets/profile-history";
import { MobilePageHeader } from "@/widgets/profile-mobile-header";
import { ProfileSidebar } from "@/widgets/profile-sidebar";

import type { Appointment } from "@/entities/appointment";

import { getProfileAppointments } from "@/shared/api/profile/requests";
import { profileKeys } from "@/shared/api/queryKeys";
import { SegmentedControl } from "@/shared/ui/segmented-control";

const TABS = [
  { value: "upcoming" as const, label: "Предстоящие" },
  { value: "completed" as const, label: "Прошедшие" },
];

export const ProfileHistoryPage: FC = () => {
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed">(
    "upcoming",
  );

  const { data, isLoading } = useQuery({
    queryKey: profileKeys.appointments({ status: activeTab }),
    queryFn: () => getProfileAppointments(activeTab),
  });

  const appointments: Appointment[] = (data?.data ?? []).map((a) => ({
    id: String(a.id),
    doctorId: "",
    doctorName: a.doctor,
    doctorSpecialty: "",
    doctorClinic: a.clinic,
    doctorRating: 0,
    date: a.date,
    time: a.time,
    service: a.service,
    price: 0,
    address: "",
    status: a.status === "confirmed" ? "upcoming" : a.status,
  }));

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
            <h2 className="text-[28px] md:text-[32px] font-semibold text-[#191A1B] mb-6 hidden md:block">
              История записей
            </h2>

            <div className="md:hidden mb-6">
              <SegmentedControl
                options={TABS}
                value={activeTab}
                onChange={setActiveTab}
              />
            </div>

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

            {isLoading ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-[#E5E6E8] text-[#838A8D]">
                Загрузка...
              </div>
            ) : (
              <HistoryWidget
                appointments={appointments}
                activeTab={activeTab}
              />
            )}
          </main>
        </div>
      </div>
    </>
  );
};
