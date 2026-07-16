"use client";

import { FC, useState } from "react";

import { useQueries, useQuery } from "@tanstack/react-query";

import { MobilePageHeader } from "@/widgets/profile/mobile-header";

import {
  getDoctorById,
  getProfileAppointments,
  profileKeys,
} from "@/shared/api";
import { FilterSample } from "@/shared/assets/icons";
import { SearchInput } from "@/shared/ui/input/search-input";
import { SegmentedControl } from "@/shared/ui/segmented-control";

import { Appointment } from "./history/AppointmentCard/model";
import { ProfileHistory } from "./history/ui";

// Кнопка-фильтр рядом с поиском, как в макете. Поведение (панель фильтров)
// пока не задано — визуальный элемент под будущую фильтрацию.
const FilterButton: FC = () => (
  <button
    type="button"
    aria-label="Фильтры"
    className="w-11 h-11 shrink-0 rounded-full border border-border bg-white flex items-center justify-center hover:bg-surface transition-colors"
  >
    <FilterSample className="w-4.5 h-4.5" />
  </button>
);

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

// Подмножество полей врача из getDoctorById, которые нужны карточке записи
// (специальность, рейтинг, фото, адрес клиники/места работы).
type DoctorDetails = {
  specialty?: string;
  rating?: string | number;
  photo?: string;
  clinic?: { name?: string; address?: string };
  workplaces?: Array<{ address?: string }>;
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
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading: isAppointmentsLoading } = useQuery({
    queryKey: profileKeys.appointments({ status: activeTab }),
    queryFn: () => getProfileAppointments(activeTab),
  });

  const rawAppointments = data?.data ?? [];
  const doctorIds = Array.from(
    new Set(rawAppointments.map((a) => toEntityId(a.doctor)).filter(Boolean)),
  );

  const doctorQueries = useQueries({
    queries: doctorIds.map((id) => ({
      queryKey: ["doctor", id],
      queryFn: () => getDoctorById(id),
      staleTime: 5 * 60 * 1000,
    })),
  });

  const isDoctorsLoading = doctorQueries.some((q) => q.isLoading);
  const isLoading = isAppointmentsLoading || isDoctorsLoading;

  const doctorsMap = new Map<string, DoctorDetails>();
  doctorQueries.forEach((q, index) => {
    if (q.data) {
      doctorsMap.set(doctorIds[index], q.data as DoctorDetails);
    }
  });

  const appointments: Appointment[] = rawAppointments.map((a) => {
    const docId = toEntityId(a.doctor);
    const doctorDetails = doctorsMap.get(docId);

    let address = "";
    if (doctorDetails?.clinic?.address) {
      address = doctorDetails.clinic.address;
    } else if (
      Array.isArray(doctorDetails?.workplaces) &&
      doctorDetails.workplaces[0]?.address
    ) {
      address = doctorDetails.workplaces[0].address;
    }

    return {
      id: String(a.id),
      doctorId: docId,
      doctorName: toDisplayName(a.doctor),
      doctorSpecialty: doctorDetails?.specialty || "",
      doctorClinic:
        toDisplayName(a.clinic) || doctorDetails?.clinic?.name || "",
      doctorRating: doctorDetails?.rating
        ? parseFloat(String(doctorDetails.rating)) || 0
        : 0,
      doctorImage: doctorDetails?.photo || "",
      date: a.date,
      time: a.time,
      service: toDisplayName(a.service),
      price: toServicePrice(a.service),
      address,
      status:
        a.status === "confirmed" || a.status === "pending"
          ? "upcoming"
          : a.status,
      isOnline: a.is_online,
      googleMeetLink: a.google_meet_link,
    };
  });

  return (
    <>
      <MobilePageHeader title="История записей" />
      <div className="px-4 py-8 md:p-0">
        {/* Desktop: заголовок + поиск с фильтром в одну строку, табы ниже */}
        <div className="hidden md:flex items-center justify-between gap-6 mb-5">
          <h2 className="text-[32px] font-semibold text-foreground">
            История записей
          </h2>
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-80">
              <SearchInput value={searchQuery} onChange={setSearchQuery} />
            </div>
            <FilterButton />
          </div>
        </div>
        <div className="hidden md:block w-75 mb-6">
          <SegmentedControl
            options={TABS}
            value={activeTab}
            onChange={setActiveTab}
          />
        </div>

        {/* Mobile: поиск с фильтром, затем сегмент-переключатель */}
        <div className="md:hidden mb-6 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <SearchInput value={searchQuery} onChange={setSearchQuery} />
            </div>
            <FilterButton />
          </div>
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
          <ProfileHistory
            appointments={appointments}
            activeTab={activeTab}
            searchQuery={searchQuery}
          />
        )}
      </div>
    </>
  );
};
