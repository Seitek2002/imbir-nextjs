"use client";

import { FC, useState } from "react";

import Link from "next/link";

import {
  HistoryIcon,
  LogoutIcon,
  ReviewsIcon,
  SavedIcon,
  SettingsIcon,
} from "@/shared/assets/icons";
import { useLogout } from "@/shared/lib/useLogout";
import { useUserStatus } from "@/shared/lib/useReference";
import { useSidebarIndicator } from "@/shared/lib/useSidebarIndicator";
import { useAuthStore } from "@/shared/store";
import { ImageWithFallback } from "@/shared/ui";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";

// «Настройки профиля» — последний пункт, сразу перед «Выйти из профиля»
// (порядок должен совпадать с мобильным меню, см. pages/profile/menu).
const MENU_ITEMS = [
  { href: "/profile/history", label: "История записей", icon: HistoryIcon },
  { href: "/profile/saved", label: "Сохранённое", icon: SavedIcon },
  { href: "/profile/reviews", label: "Отзывы", icon: ReviewsIcon },
  { href: "/profile/my-data", label: "Настройки профиля", icon: SettingsIcon },
];

const CHEVRON = (
  <svg
    className="w-5 h-5 ml-auto shrink-0 text-dim"
    fill="none"
    viewBox="0 0 20 20"
  >
    <path
      d="M7.5 15L12.5 10L7.5 5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ProfileSidebar: FC = () => {
  const { navRef, indicator, pathname } = useSidebarIndicator();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const handleLogout = useLogout();

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      await handleLogout();
      setLogoutOpen(false);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const user = useAuthStore((s) => s.user);
  const { status: userStatus, percent } = useUserStatus();

  const displayName = user
    ? `${user.first_name} ${user.last_name ?? ""}`.trim()
    : "—";
  const initials = user?.first_name?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <>
      <div className="w-full max-w-88 flex flex-col gap-4">
        {/* Profile Card — белая рамка с отступом 4px, внутри градиентная подложка */}
        <div className="bg-white border border-border-soft rounded-3xl p-1">
          <div className="bg-linear-to-b from-[#FFE2DA] to-white rounded-[20px] px-6 py-5 flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-linear-to-br from-primary to-[#FF8A6B] flex items-center justify-center shrink-0">
              <ImageWithFallback
                src={user?.avatar}
                alt={displayName}
                width={80}
                height={80}
                className="w-full h-full object-cover"
                fallback={
                  <span className="text-white text-2xl font-bold">
                    {initials}
                  </span>
                }
              />
            </div>
            <h3 className="text-foreground font-semibold text-base">
              {displayName}
            </h3>
          </div>
        </div>

        {/* Menu */}
        <nav
          ref={navRef}
          className="bg-white border border-border-soft rounded-3xl py-2 px-2 flex flex-col gap-1 relative"
        >
          <div
            className="absolute inset-x-2 rounded-2xl bg-primary-tint transition-all duration-200 ease-out pointer-events-none"
            style={{ top: indicator.top, height: indicator.height }}
          />

          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                data-active={isActive ? "true" : undefined}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl relative z-10 ${!isActive && "hover:bg-surface"}`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200 ${isActive ? "bg-primary text-white" : "bg-primary-tint text-primary"}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`font-medium text-base transition-colors duration-200 ${isActive ? "text-foreground" : "text-secondary"}`}
                >
                  {item.label}
                </span>
                {CHEVRON}
              </Link>
            );
          })}
        </nav>

        {/* Logout — своя рамка + небольшой отступ со всех сторон */}
        <button
          onClick={() => setLogoutOpen(true)}
          className="bg-white border border-border-soft rounded-3xl p-1 w-full group"
        >
          <div className="flex items-center gap-3 px-4 py-3.5 rounded-[20px] text-secondary group-hover:bg-surface transition-colors">
            <div className="w-9 h-9 rounded-xl bg-primary-tint flex items-center justify-center shrink-0 text-primary">
              <LogoutIcon className="w-5 h-5" />
            </div>
            <span className="font-medium text-base">Выйти из профиля</span>
            {CHEVRON}
          </div>
        </button>

        {/* Статус — GET /api/references/user-status/{id}/; нет отзывов у
            пользователя, значит status: null и карточку не показываем. */}
        {userStatus && percent !== null && (
          <div className="bg-white rounded-3xl p-6">
            <p className="text-muted text-sm mb-2">Статус пользователя</p>
            <h4 className="text-primary text-2xl font-bold mb-3">
              {userStatus.name}
            </h4>
            <p className="text-secondary text-sm leading-relaxed mb-6">
              {userStatus.description}
            </p>
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted text-xs">
                Положительных
                <br />
                отзывов
              </span>
              <span className="text-muted text-xs text-right">
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
        )}
      </div>

      <ConfirmDialog
        isOpen={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleLogoutConfirm}
        isLoading={isLoggingOut}
        closeOnConfirm={false}
        icon={<LogoutIcon className="w-7 h-7 text-primary" />}
        title="Выйти из профиля?"
        description="Для продолжения работы потребуется снова войти в аккаунт"
        confirmLabel="Выйти"
        cancelLabel="Отмена"
      />
    </>
  );
};
