"use client";

import { FC, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { MobilePageHeader } from "@/widgets/profile/mobile-header";

import { getProfileAppointments, profileKeys } from "@/shared/api";
import { SegmentedControl } from "@/shared/ui/segmented-control";

import { Appointment } from "./history/AppointmentCard/model";
import { ProfileHistory } from "./history/ui";

const TABS = [
  { value: "upcoming" as const, label: "Предстоящие" },
  { value: "completed" as const, label: "Прошедшие" },
];

// Бэк на /api/profile/appointments/ иногда отдаёт doctor/clinic/service
// объектом ({id, full_name}), хотя тип описывает их строкой — рендерить
// объект напрямую в JSX нельзя (React падает с "Objects are not valid as
// a React child"). Достаём отображаемое имя безопасно, с fallback на "".
const toDisplayName = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (typeof obj.full_name === "string") return obj.full_name;
    if (typeof obj.name === "string") return obj.name;
  }
  return "";
};

// Из того же объекта достаём id (нужен кнопке «Написать врачу»).
const toEntityId = (value: unknown): string => {
  if (value && typeof value === "object") {
    const id = (value as Record<string, unknown>).id;
    if (typeof id === "number" || typeof id === "string") return String(id);
  }
  return "";
};

// Цена берётся из объекта услуги ({id, name, price}); бэк отдаёт число или строку.
const toServicePrice = (value: unknown): number => {
  if (value && typeof value === "object") {
    const price = (value as Record<string, unknown>).price;
    if (typeof price === "number") return price;
    if (typeof price === "string") return parseFloat(price) || 0;
  }
  return 0;
};

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
    doctorId: toEntityId(a.doctor),
    doctorName: toDisplayName(a.doctor),
    doctorSpecialty: "",
    doctorClinic: toDisplayName(a.clinic),
    doctorRating: 0,
    date: a.date,
    time: a.time,
    service: toDisplayName(a.service),
    price: toServicePrice(a.service),
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
      <div className="px-4 py-8 md:p-0">
        {/* Desktop: заголовок + сегмент-переключатель в одну строку */}
        <div className="hidden md:flex items-center justify-between mb-6">
          <h2 className="text-[32px] font-semibold text-foreground">
            История записей
          </h2>
          <div className="w-75 shrink-0">
            <SegmentedControl
              options={TABS}
              value={activeTab}
              onChange={setActiveTab}
            />
          </div>
        </div>

        {/* Mobile: сегмент под шапкой страницы */}
        <div className="md:hidden mb-6">
          <SegmentedControl
            options={TABS}
            value={activeTab}
            onChange={setActiveTab}
          />
        </div>

        {isLoading ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-border text-muted">
            Загрузка...
          </div>
        ) : (
          <ProfileHistory appointments={appointments} activeTab={activeTab} />
        )}
      </div>
    </>
  );
};
