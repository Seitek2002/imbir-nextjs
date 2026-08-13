"use client";

import { FC } from "react";

import {
  HistoryIcon,
  ReviewsIcon,
  SavedIcon,
  SettingsIcon,
} from "@/shared/assets/icons";
import { useUserStatus } from "@/shared/lib/useReference";
import { useAuthStore } from "@/shared/store";
import {
  CabinetMenuItem,
  CabinetMobileMenu,
  ImageWithFallback,
} from "@/shared/ui";

const MENU_ITEMS: CabinetMenuItem[] = [
  {
    href: "/profile/my-data",
    label: "Настройки профиля",
    icon: <SettingsIcon className="w-5 h-5" />,
  },
  {
    href: "/profile/history",
    label: "История записей",
    icon: <HistoryIcon className="w-5 h-5" />,
  },
  {
    href: "/profile/saved",
    label: "Сохранённое",
    icon: <SavedIcon className="w-5 h-5" />,
  },
  {
    href: "/profile/reviews",
    label: "Отзывы",
    icon: <ReviewsIcon className="w-5 h-5" />,
  },
];

// Карточка статуса пациента — специфична для роли, поэтому живёт здесь и
// передаётся в footer общего меню. Данные — GET /api/references/user-status/
// {id}/; нет отзывов у пользователя, значит status: null и карточку не рисуем.
const StatusCard = () => {
  const { status, percent } = useUserStatus();
  if (!status || percent === null) return null;

  return (
    <div className="bg-white rounded-3xl p-6">
      <p className="text-muted text-sm mb-2">Статус пользователя</p>
      <h4 className="text-primary text-2xl font-bold mb-3">{status.name}</h4>
      <p className="text-secondary text-sm leading-relaxed mb-6">
        {status.description}
      </p>
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-muted text-xs">
            Положительных
            <br />
            отзывов
          </span>
          <span className="text-muted text-xs">
            Отрицательных
            <br />
            отзывов
          </span>
        </div>
        {/* Единый трек: оранжевый сегмент + синий хвост, как в макете */}
        <div className="flex items-center gap-2">
          <span className="text-primary text-sm font-semibold border border-primary rounded-lg px-2 py-0.5">
            {Math.round(percent)}%
          </span>
          <div className="flex-1 h-2 rounded-full overflow-hidden flex">
            <div
              className="bg-primary h-full"
              style={{ width: `${percent}%` }}
            />
            <div className="bg-[#8B9FFF] h-full flex-1" />
          </div>
          <span className="text-[#8B9FFF] text-sm font-semibold border border-[#8B9FFF] rounded-lg px-2 py-0.5">
            {Math.round(100 - percent)}%
          </span>
        </div>
      </div>
    </div>
  );
};

// Мобильный хаб профиля пациента — карточка, пункты меню и статус. Это НЕ
// отдельный маршрут: рендерится внутри /profile на узких экранах, а на
// десктопе тот же /profile разворачивается в двухколоночный кабинет.
export const ProfileMobileHub: FC = () => {
  const { user } = useAuthStore();
  const userName = user
    ? `${user.first_name} ${user.last_name?.charAt(0) ?? ""}`.trim()
    : "";

  return (
    <CabinetMobileMenu
      avatar={
        <ImageWithFallback
          src={user?.avatar}
          alt={userName}
          width={80}
          height={80}
          className="w-full h-full object-cover"
          fallback={
            <span className="text-white text-2xl font-bold">
              {userName.charAt(0)}
            </span>
          }
        />
      }
      name={userName}
      subtitle={
        user?.email ? (
          <p className="text-muted text-sm mt-0.5">{user.email}</p>
        ) : undefined
      }
      items={MENU_ITEMS}
      footer={<StatusCard />}
    />
  );
};
