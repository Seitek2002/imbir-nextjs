"use client";

import {
  HistoryIcon,
  PersonIcon,
  ReviewsIcon,
  SavedIcon,
} from "@/shared/assets/icons";
import { useAuthStore } from "@/shared/store";
import { CabinetMenuItem, CabinetMobileMenu } from "@/shared/ui";

const MENU_ITEMS: CabinetMenuItem[] = [
  {
    href: "/profile/my-data",
    label: "Мои данные",
    icon: <PersonIcon className="w-5 h-5" />,
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
// передаётся в footer общего меню.
const StatusCard = () => (
  <div className="bg-white rounded-3xl p-6">
    <p className="text-muted text-sm mb-2">Статус пользователя</p>
    <h4 className="text-primary text-2xl font-bold mb-3">Витамин C</h4>
    <p className="text-secondary text-sm leading-relaxed mb-6">
      Ваши отзывы действуют на врачей как ударная доза витамина C! Вы замечаете
      светлые стороны, дарите надежду другим пациентам и помогаете клинике
      расцветать. Спасибо за ваш позитивный заряд!
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
          90%
        </span>
        <div className="flex-1 h-2 rounded-full overflow-hidden flex">
          <div className="bg-primary h-full" style={{ width: "90%" }} />
          <div className="bg-[#8B9FFF] h-full flex-1" />
        </div>
        <span className="text-[#8B9FFF] text-sm font-semibold border border-[#8B9FFF] rounded-lg px-2 py-0.5">
          10%
        </span>
      </div>
    </div>
  </div>
);

export default function ProfileMenuPage() {
  const { user } = useAuthStore();
  const userName = user
    ? `${user.first_name} ${user.last_name?.charAt(0) ?? ""}`.trim()
    : "";

  return (
    <CabinetMobileMenu
      avatar={
        <span className="text-white text-2xl font-bold">
          {userName.charAt(0)}
        </span>
      }
      name={userName}
      items={MENU_ITEMS}
      footer={<StatusCard />}
    />
  );
}
