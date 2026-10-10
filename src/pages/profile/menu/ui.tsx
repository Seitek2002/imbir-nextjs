"use client";

import { FC } from "react";

import { UserStatusCard } from "@/entities/user-status";

import {
  HistoryIcon,
  ReviewsIcon,
  SavedIcon,
  SettingsIcon,
} from "@/shared/assets/icons";
import { useAuthStore } from "@/shared/store";
import {
  CabinetMenuItem,
  CabinetMobileMenu,
  ImageWithFallback,
} from "@/shared/ui";

// «Настройки профиля» — последний пункт, сразу перед «Выйти из профиля»:
// сначала то, за чем в кабинет приходят (записи, сохранённое, отзывы), а
// настройки и выход — рядом, в конце.
const MENU_ITEMS: CabinetMenuItem[] = [
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
  {
    href: "/profile/my-data",
    label: "Настройки профиля",
    icon: <SettingsIcon className="w-5 h-5" />,
  },
];

const PHONE_PLACEHOLDER_SUFFIX = "@phone.imbir.kg";

// Карточка статуса пациента — специфична для роли, поэтому живёт здесь и
// передаётся в footer общего меню. Данные — GET /api/references/user-status/
// {id}/; нет отзывов у пользователя, значит status: null и карточку не рисуем.
// Мобильный хаб профиля пациента — карточка, пункты меню и статус. Это НЕ
// отдельный маршрут: рендерится внутри /profile на узких экранах, а на
// десктопе тот же /profile разворачивается в двухколоночный кабинет.
export const ProfileMobileHub: FC = () => {
  const { user } = useAuthStore();
  const userName = user
    ? `${user.first_name} ${user.last_name?.charAt(0) ?? ""}`.trim()
    : "";
  // У зарегистрированного по телефону почты нет: старый бэк отдаёт вместо неё
  // технический адрес *@phone.imbir.kg (новый — пустую строку). Его не
  // показываем, а подписываем карточку номером телефона.
  const email = user?.email?.toLowerCase().endsWith(PHONE_PLACEHOLDER_SUFFIX)
    ? ""
    : user?.email;
  const contact = email || user?.phone || "";

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
        contact ? (
          <p className="text-muted text-sm mt-0.5">{contact}</p>
        ) : undefined
      }
      items={MENU_ITEMS}
      footer={<UserStatusCard />}
    />
  );
};
