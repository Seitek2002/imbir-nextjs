"use client";

import { FC } from "react";

import { useDoctorCabinet } from "@/widgets/doctor/layout";

import { StarIcon } from "@/shared/assets/icons";
import { colors } from "@/shared/config";
import { CabinetMobileMenu, ImageWithFallback } from "@/shared/ui";

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

// Мобильный хаб кабинета врача — карточка профиля, меню разделов и выход,
// как в макете. Это НЕ отдельный маршрут: рендерится внутри /doctor-profile
// на узких экранах (как ProfileMobileHub у пациента), а на десктопе тот же
// адрес разворачивается в двухколоночный кабинет с сайдбаром.
export const DoctorProfileMobileHub: FC = () => {
  const { profile: d } = useDoctorCabinet();

  // Пока профиль грузится, показываем меню с пустой карточкой: пункты и
  // выход доступны сразу, а не после ответа сервера.
  const fullName = d?.fullName ?? "";

  return (
    <CabinetMobileMenu
      avatar={
        <ImageWithFallback
          src={d?.photo}
          alt={fullName}
          width={80}
          height={80}
          className="w-full h-full object-cover"
          fallback={
            <span className="text-white text-2xl font-bold">
              {fullName.charAt(0)}
            </span>
          }
        />
      }
      name={fullName}
      // В макете под именем только рейтинг — без специальности.
      subtitle={
        d ? (
          <div className="flex items-center justify-center gap-1.5 mt-1">
            <StarIcon className="w-4 h-4 text-primary" />
            <span className="text-primary text-sm font-medium">{d.rating}</span>
          </div>
        ) : undefined
      }
      items={MENU_ITEMS}
    />
  );
};
