"use client";

import { FC } from "react";

import Image from "next/image";
import Link from "next/link";

import { useQuery } from "@tanstack/react-query";

import { useDoctorCabinet } from "@/widgets/doctor/layout";
import { DoctorSidebar } from "@/widgets/doctor/layout";

import { doctorCabinetKeys, getDoctorStats } from "@/shared/api";
import { ChevronRightIcon, LogoutIcon, StarIcon } from "@/shared/assets/icons";
import { colors } from "@/shared/config";
import { useLogout } from "@/shared/lib/useLogout";

// Плитки статистики кабинета (GET /api/doctor/stats/).
const DoctorStatsTiles: FC = () => {
  const { data: stats } = useQuery({
    queryKey: doctorCabinetKeys.stats(),
    queryFn: getDoctorStats,
  });

  if (!stats) return null;

  const tiles = [
    { label: "Просмотры профиля", value: stats.profile_views },
    { label: "Записей всего", value: stats.appointments.total },
    {
      label: "Предстоящие записи",
      value: stats.appointments.pending + stats.appointments.confirmed,
    },
    { label: "Пациентов", value: stats.patients_count },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          className="bg-white rounded-2xl border border-border p-4"
        >
          <p className="text-2xl font-semibold text-foreground">{tile.value}</p>
          <p className="text-muted text-xs mt-1">{tile.label}</p>
        </div>
      ))}
    </div>
  );
};

const MENU_ITEMS = [
  {
    href: "/doctor-profile/my-data",
    label: "Мои данные",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M10 10C12.2091 10 14 8.20914 14 6C14 3.79086 12.2091 2 10 2C7.79086 2 6 3.79086 6 6C6 8.20914 7.79086 10 10 10Z"
          stroke={colors.primary}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3 18C3 15.2386 6.13401 13 10 13C13.866 13 17 15.2386 17 18"
          stroke={colors.primary}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/doctor-profile/appointments",
    label: "Записи",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M13.3333 0.833336V4.16667M6.66667 0.833336V4.16667M2.5 7.5H17.5M4.16667 2.5H15.8333C16.7538 2.5 17.5 3.24619 17.5 4.16667V15.8333C17.5 16.7538 16.7538 17.5 15.8333 17.5H4.16667C3.24619 17.5 2.5 16.7538 2.5 15.8333V4.16667C2.5 3.24619 3.24619 2.5 4.16667 2.5Z"
          stroke={colors.primary}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/doctor-profile/patients",
    label: "Пациенты",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M14.1667 17.5V15.8333C14.1667 14.9493 13.8155 14.1014 13.1904 13.4763C12.5652 12.8512 11.7174 12.5 10.8333 12.5H4.16667C3.28261 12.5 2.43477 12.8512 1.80965 13.4763C1.18453 14.1014 0.833336 14.9493 0.833336 15.8333V17.5M10.8333 5.83333C10.8333 7.67428 9.34095 9.16667 7.5 9.16667C5.65905 9.16667 4.16667 7.67428 4.16667 5.83333C4.16667 3.99238 5.65905 2.5 7.5 2.5C9.34095 2.5 10.8333 3.99238 10.8333 5.83333Z"
          stroke={colors.primary}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/doctor-profile/services",
    label: "Услуги",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M15.8333 2.5H4.16667C3.24619 2.5 2.5 3.24619 2.5 4.16667V15.8333C2.5 16.7538 3.24619 17.5 4.16667 17.5H15.8333C16.7538 17.5 17.5 16.7538 17.5 15.8333V4.16667C17.5 3.24619 16.7538 2.5 15.8333 2.5Z"
          stroke={colors.primary}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M10 6.66667V13.3333M6.66667 10H13.3333"
          stroke={colors.primary}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/doctor-profile/reviews",
    label: "Отзывы",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M10 1.66667L12.575 6.88334L18.3333 7.72501L14.1667 11.7833L15.15 17.5167L10 14.8083L4.85 17.5167L5.83333 11.7833L1.66667 7.72501L7.425 6.88334L10 1.66667Z"
          stroke={colors.primary}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export const DoctorProfilePage: FC = () => {
  const { profile: d } = useDoctorCabinet();
  const handleLogout = useLogout();
  if (!d) return null;

  return (
    <div className="w-full min-h-screen bg-[#FAFAFA]">
      {/* Mobile layout */}
      <div className="lg:hidden">
        <div className="px-4 pt-8 pb-6 flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-linear-to-br from-primary to-[#FF8A6B] flex items-center justify-center">
            {d.photo ? (
              <Image
                src={d.photo}
                alt={d.fullName}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white text-2xl font-bold">
                {d.fullName.charAt(0)}
              </span>
            )}
          </div>
          <div className="text-center">
            <p className="text-foreground font-semibold text-lg">
              {d.fullName}
            </p>
            <div className="flex items-center justify-center gap-1.5 mt-1">
              <StarIcon className="w-4 h-4 text-primary" />
              <span className="text-primary text-sm font-medium">
                {d.rating}
              </span>
              <span className="text-muted text-sm">· {d.specialty}</span>
            </div>
          </div>
        </div>

        <div className="px-4 pb-6">
          <DoctorStatsTiles />
          <nav className="bg-white rounded-3xl p-2 flex flex-col gap-1">
            {MENU_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl hover:bg-surface transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-primary-tint flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <span className="flex-1 font-medium text-base text-foreground">
                  {item.label}
                </span>
                <ChevronRightIcon className="w-5 h-5 text-dim" />
              </Link>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="mt-3 w-full bg-white rounded-3xl px-6 py-4 flex items-center gap-3 hover:bg-surface transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-primary-tint flex items-center justify-center shrink-0">
              <LogoutIcon className="w-5 h-5 [&_path]:stroke-primary" />
            </div>
            <span className="font-medium text-base text-secondary">
              Выйти из профиля
            </span>
          </button>
        </div>
      </div>

      {/* Desktop layout */}
      <div className="hidden lg:block max-w-360 mx-auto px-10 py-8">
        <h1 className="text-[40px] font-semibold text-foreground mb-8">
          Мой профиль
        </h1>
        <div className="flex gap-6">
          <DoctorSidebar
            fullName={d.fullName}
            photo={d.photo}
            specialty={d.specialty}
            rating={d.rating}
          />
          <main className="flex-1 min-w-0">
            <DoctorStatsTiles />
            <div className="bg-white rounded-3xl border border-border p-8">
              <div className="flex items-center gap-6 mb-8">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-linear-to-br from-primary to-[#FF8A6B] flex items-center justify-center shrink-0">
                  {d.photo ? (
                    <Image
                      src={d.photo}
                      alt={d.fullName}
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-white text-3xl font-bold">
                      {d.fullName.charAt(0)}
                    </span>
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-foreground">
                    {d.fullName}
                  </h2>
                  <p className="text-muted mt-1">
                    {d.specialty} · {d.additionalSpecialty}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <StarIcon className="w-4 h-4 text-primary" />
                    <span className="text-primary font-medium">{d.rating}</span>
                    <span className="text-muted text-sm">
                      ({d.totalReviews} отзывов)
                    </span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {MENU_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 p-4 rounded-2xl border border-border hover:border-primary hover:bg-primary-tint transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary-tint flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <span className="font-medium text-foreground flex-1">
                      {item.label}
                    </span>
                    <ChevronRightIcon className="w-5 h-5 text-dim" />
                  </Link>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
