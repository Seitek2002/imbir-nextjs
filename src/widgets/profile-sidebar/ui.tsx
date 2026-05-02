"use client";

import { FC } from "react";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  HistoryIcon,
  LogoutIcon,
  ReviewsIcon,
  SavedIcon,
  SettingsIcon,
} from "@/shared/assets";

const MENU_ITEMS = [
  {
    href: "/profile/settings",
    label: "Настройки профиля",
    icon: SettingsIcon,
  },
  {
    href: "/profile/history",
    label: "История записей",
    icon: HistoryIcon,
  },
  {
    href: "/profile/saved",
    label: "Сохранённое",
    icon: SavedIcon,
  },
  {
    href: "/profile/reviews",
    label: "Отзывы",
    icon: ReviewsIcon,
  },
];

// todo: Надо все раздробить на еще более мелкие компоненты

export const ProfileSidebar: FC = () => {
  const pathname = usePathname();

  return (
    <div className="w-full max-w-88 flex flex-col gap-4">
      {/* Profile Card */}
      <Link
        href="/profile"
        className="bg-white rounded-3xl px-6 py-5 flex items-center gap-3 hover:bg-[#FAFAFA] transition-colors group"
      >
        <div className="w-14 h-14 rounded-full overflow-hidden bg-[#F8F9FA] shrink-0">
          <Image
            src="/path-to-avatar.jpg"
            alt="Айжан К. К."
            width={56}
            height={56}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-[#191A1B] font-semibold text-base">
            Айжан К. К.
          </h3>
        </div>
        <svg
          className="w-5 h-5 text-[#C4C8CA] group-hover:text-[#838A8D] transition-colors shrink-0"
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

      {/* Menu */}
      <nav className="bg-white rounded-3xl py-2 px-2 flex flex-col gap-1">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-colors group ${
                isActive ? "bg-[#FFF8F5]" : "hover:bg-[#F8F9FA]"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  isActive ? "bg-[#F5653E]" : "bg-[#FFF8F5]"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    isActive
                      ? "[&_path]:stroke-white"
                      : "[&_path]:stroke-[#F5653E]"
                  }`}
                />
              </div>
              <span
                className={`font-medium text-base ${
                  isActive ? "text-[#191A1B]" : "text-[#686F72]"
                }`}
              >
                {item.label}
              </span>
              <svg
                className={`w-5 h-5 ml-auto shrink-0 ${
                  isActive ? "text-[#C4C8CA]" : "text-[#C4C8CA]"
                }`}
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
      {/* todo: Вместо обычной button надо переиспользовать компонент <Button /> */}
      <button className="bg-white rounded-3xl px-6 py-4 flex items-center gap-3 text-[#686F72] hover:bg-[#F8F9FA] transition-colors group">
        <div className="w-9 h-9 rounded-xl bg-[#FFF8F5] flex items-center justify-center shrink-0">
          <LogoutIcon className="w-5 h-5 [&_path]:stroke-[#F5653E]" />
        </div>
        <span className="font-medium text-base">Выйти из профиля</span>
        <svg
          className="w-5 h-5 ml-auto text-[#C4C8CA] group-hover:text-[#838A8D] transition-colors shrink-0"
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

      {/* Vitamin C Status */}
      {/* todo: Сделать компонент из блока ниже */}
      <div className="bg-white rounded-3xl p-6">
        <p className="text-[#838A8D] text-sm mb-2">Статус пользователя</p>
        <h4 className="text-[#F5653E] text-2xl font-bold mb-3">Витамин C</h4>
        <p className="text-[#686F72] text-sm leading-relaxed mb-6">
          Ваши отзывы действуют на врачей как ударная доза витамина C! Вы
          замечаете светлые стороны, дарите надежду другим пациентам и помогаете
          клинике расцветать. Спасибо за ваш позитивный заряд!
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
                    className="bg-linear-to-r from-[#F5653E] to-[#F5653E] h-full rounded-full"
                    style={{ width: "90%" }}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-12 bg-linear-to-r from-[#8B9FFF] to-[#8B9FFF] rounded-full h-2" />
                <span className="text-[#8B9FFF] text-sm font-semibold border border-[#8B9FFF] rounded-lg px-2 py-0.5">
                  10%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
