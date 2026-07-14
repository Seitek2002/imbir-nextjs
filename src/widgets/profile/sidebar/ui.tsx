"use client";

import { FC, useState } from "react";

import Link from "next/link";

import {
  HistoryIcon,
  LogoutIcon,
  PersonIcon,
  ReviewsIcon,
  SavedIcon,
} from "@/shared/assets/icons";
import { useLogout } from "@/shared/lib/useLogout";
import { useSidebarIndicator } from "@/shared/lib/useSidebarIndicator";
import { useAuthStore } from "@/shared/store";
import { ImageWithFallback } from "@/shared/ui";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";

const MENU_ITEMS = [
  { href: "/profile/my-data", label: "Мои данные", icon: PersonIcon },
  { href: "/profile/history", label: "История записей", icon: HistoryIcon },
  { href: "/profile/saved", label: "Сохранённое", icon: SavedIcon },
  { href: "/profile/reviews", label: "Отзывы", icon: ReviewsIcon },
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
  const handleLogout = useLogout();

  const user = useAuthStore((s) => s.user);

  const displayName = user
    ? `${user.first_name} ${user.last_name ?? ""}`.trim()
    : "—";
  const initials = user?.first_name?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <>
      <div className="w-full max-w-88 flex flex-col gap-4">
        {/* Profile Card — градиентная карточка с аватаром по центру, как в макете */}
        <div className="bg-linear-to-b from-[#FFE2DA] to-white border border-border-soft rounded-3xl px-6 py-5 flex flex-col items-center gap-3">
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

        {/* Menu */}
        <nav
          ref={navRef}
          className="bg-white rounded-3xl py-2 px-2 flex flex-col gap-1 relative"
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

        {/* Logout */}
        <button
          onClick={() => setLogoutOpen(true)}
          className="bg-white rounded-3xl px-6 py-4 flex items-center gap-3 text-secondary hover:bg-surface transition-colors group"
        >
          <div className="w-9 h-9 rounded-xl bg-primary-tint flex items-center justify-center shrink-0 text-primary">
            <LogoutIcon className="w-5 h-5" />
          </div>
          <span className="font-medium text-base">Выйти из профиля</span>
          {CHEVRON}
        </button>

        {/* Status — static block, will be driven by backend later */}
        <div className="bg-white rounded-3xl p-6">
          <p className="text-muted text-sm mb-2">Статус пользователя</p>
          <h4 className="text-primary text-2xl font-bold mb-3">Витамин C</h4>
          <p className="text-secondary text-sm leading-relaxed mb-6">
            Ваши отзывы действуют на врачей как ударная доза витамина C! Вы
            замечаете светлые стороны, дарите надежду другим пациентам и
            помогаете клинике расцветать. Спасибо за ваш позитивный заряд!
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

      <ConfirmDialog
        isOpen={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleLogout}
        icon={<LogoutIcon className="w-7 h-7 text-primary" />}
        title="Выйти из профиля?"
        description="Для продолжения работы потребуется снова войти в аккаунт"
        confirmLabel="Выйти"
        cancelLabel="Отмена"
      />
    </>
  );
};
