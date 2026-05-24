"use client";

import { FC, useLayoutEffect, useRef, useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  HistoryIcon,
  LogoutIcon,
  PersonIcon,
  ReviewsIcon,
  SavedIcon,
} from "@/shared/assets";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";

const MENU_ITEMS = [
  { href: "/profile/my-data", label: "Мои данные", icon: PersonIcon },
  { href: "/profile/history", label: "История записей", icon: HistoryIcon },
  { href: "/profile/saved", label: "Сохранённое", icon: SavedIcon },
  { href: "/profile/reviews", label: "Отзывы", icon: ReviewsIcon },
];

export const ProfileSidebar: FC = () => {
  const pathname = usePathname();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const [indicator, setIndicator] = useState({ top: 0, height: 0 });

  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const active = nav.querySelector('[data-active="true"]') as HTMLElement;
    if (!active) return;
    setIndicator({ top: active.offsetTop, height: active.offsetHeight });
  }, [pathname]);

  return (
    <>
      <div className="w-full max-w-88 flex flex-col gap-4">
        {/* Profile Card */}
        <div className="bg-linear-to-br from-[#FFE5DC] to-[#FFD4C8] rounded-3xl px-6 py-5 flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-white shrink-0">
            <Image
              src="/path-to-avatar.jpg"
              alt="Айжан К. К."
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="text-[#191A1B] font-semibold text-base">
            Айжан К. К.
          </h3>
        </div>

        {/* Menu */}
        <nav
          ref={navRef}
          className="bg-white rounded-3xl py-2 px-2 flex flex-col gap-1 relative"
        >
          <div
            className="absolute inset-x-2 rounded-2xl bg-[#FFF8F5] transition-all duration-200 ease-out pointer-events-none"
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
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl relative z-10 ${!isActive && "hover:bg-[#F8F9FA]"}`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200 ${isActive ? "bg-[#F5653E] text-white" : "bg-[#FFF8F5] text-[#F5653E]"}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`font-medium text-base transition-colors duration-200 ${isActive ? "text-[#191A1B]" : "text-[#686F72]"}`}
                >
                  {item.label}
                </span>
                <svg
                  className="w-5 h-5 ml-auto shrink-0 text-[#C4C8CA]"
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
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <button
          onClick={() => setLogoutOpen(true)}
          className="bg-white rounded-3xl px-6 py-4 flex items-center gap-3 text-[#686F72] hover:bg-[#F8F9FA] transition-colors group"
        >
          <div className="w-9 h-9 rounded-xl bg-[#FFF8F5] flex items-center justify-center shrink-0 text-[#F5653E]">
            <LogoutIcon className="w-5 h-5" />
          </div>
          <span className="font-medium text-base">Выйти из профиля</span>
          <svg
            className="w-5 h-5 ml-auto text-[#C4C8CA] shrink-0"
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
        </button>

        {/* Status */}
        <div className="bg-white rounded-3xl p-6">
          <p className="text-[#838A8D] text-sm mb-2">Статус пользователя</p>
          <h4 className="text-[#F5653E] text-2xl font-bold mb-3">Витамин C</h4>
          <p className="text-[#686F72] text-sm leading-relaxed mb-6">
            Ваши отзывы действуют на врачей как ударная доза витамина C! Вы
            замечаете светлые стороны, дарите надежду другим пациентам и
            помогаете клинике расцветать. Спасибо за ваш позитивный заряд!
          </p>
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#838A8D] text-xs">
                  Положительных
                  <br />
                  отзывов
                </span>
                <span className="text-[#838A8D] text-xs">
                  Отрицательных
                  <br />
                  отзывов
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2">
                  <span className="text-[#F5653E] text-sm font-semibold border border-[#F5653E] rounded-lg px-2 py-0.5">
                    90%
                  </span>
                  <div className="flex-1 bg-[#E5E6E8] rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#F5653E] h-full rounded-full"
                      style={{ width: "90%" }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-12 bg-[#8B9FFF] rounded-full h-2" />
                  <span className="text-[#8B9FFF] text-sm font-semibold border border-[#8B9FFF] rounded-lg px-2 py-0.5">
                    10%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={() => {
          /* TODO: logout */
        }}
        icon={<LogoutIcon className="w-7 h-7 text-[#F5653E]" />}
        title="Выйти из профиля?"
        description="Для продолжения работы потребуется снова войти в аккаунт"
        confirmLabel="Выйти"
        cancelLabel="Отмена"
      />
    </>
  );
};
