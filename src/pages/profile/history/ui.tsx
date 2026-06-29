"use client";

import { FC, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { MobilePageHeader } from "@/widgets/profile/mobile-header";
import { ProfileSidebar } from "@/widgets/profile/sidebar";

import { getProfileAppointments, profileKeys } from "@/shared/api";
import { SegmentedControl } from "@/shared/ui/segmented-control";

import { Appointment } from "./history/AppointmentCard/model";
import { ProfileHistory } from "./history/ui";

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
    status:
      a.status === "confirmed" || a.status === "pending"
        ? "upcoming"
        : a.status,
    isOnline: a.is_online,
    googleMeetLink: a.google_meet_link,
  }));

  return (
    <>
      <MobilePageHeader title="История записей" />
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
                      ? "border-foreground text-foreground bg-white"
                      : "border-border text-muted bg-white hover:border-dim"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="bg-white rounded-3xl p-10 text-center border border-border text-muted">
                Загрузка...
              </div>
            ) : (
              <ProfileHistory
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
