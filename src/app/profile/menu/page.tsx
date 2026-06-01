"use client";

import { useState } from "react";

import Link from "next/link";

import {
  HistoryIcon,
  LogoutIcon,
  PersonIcon,
  ReviewsIcon,
  SavedIcon,
} from "@/shared/assets";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";

const MOCK_USER_NAME = "Айжан К. К.";

const MENU_ITEMS = [
  { href: "/profile/my-data", label: "Мои данные", icon: PersonIcon },
  { href: "/profile/history", label: "История записей", icon: HistoryIcon },
  { href: "/profile/saved", label: "Сохранённое", icon: SavedIcon },
  { href: "/profile/reviews", label: "Отзывы", icon: ReviewsIcon },
];

export default function ProfileMenuPage() {
  const [logoutOpen, setLogoutOpen] = useState(false);

  return (
    <>
      <div className="min-h-screen bg-[#FAFAFA]">
        <div className="px-4 py-6">
          <h1 className="text-2xl font-semibold text-[#191A1B] mb-6">
            Мой профиль
          </h1>

          {/* Profile Card */}
          <div className="bg-linear-to-br from-[#FFE5DC] to-[#FFD4C8] rounded-3xl p-6 mb-4 flex flex-col items-center gap-3">
            <div
              className="w-20 h-20 rounded-full bg-linear-to-br from-[#F5653E] to-[#FF8A6B] flex items-center justify-center"
              aria-label={MOCK_USER_NAME}
            >
              <span className="text-white text-2xl font-bold">
                {MOCK_USER_NAME.charAt(0)}
              </span>
            </div>
            <h2 className="text-[#191A1B] font-semibold text-lg">
              {MOCK_USER_NAME}
            </h2>
          </div>

          {/* Menu */}
          <nav className="bg-white rounded-3xl p-2 flex flex-col gap-1 mb-4">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-2xl hover:bg-[#F8F9FA] transition-colors"
                >
                  <div className="w-9 h-9 rounded-xl bg-[#FFF8F5] flex items-center justify-center shrink-0 text-[#F5653E]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="flex-1 font-medium text-base text-[#686F72]">
                    {item.label}
                  </span>
                  <svg
                    className="w-5 h-5 text-[#C4C8CA] shrink-0"
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
            className="bg-white rounded-3xl px-6 py-4 flex items-center gap-3 text-[#686F72] hover:bg-[#F8F9FA] transition-colors w-full mb-6"
          >
            <div className="w-9 h-9 rounded-xl bg-[#FFF8F5] flex items-center justify-center shrink-0">
              <LogoutIcon className="w-5 h-5 [&_path]:stroke-[#F5653E]" />
            </div>
            <span className="font-medium text-base">Выйти из профиля</span>
            <svg
              className="w-5 h-5 text-[#C4C8CA] ml-auto shrink-0"
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

          {/* Status Card */}
          <div className="bg-white rounded-3xl p-6">
            <p className="text-[#838A8D] text-sm mb-2">Статус пользователя</p>
            <h4 className="text-[#F5653E] text-2xl font-bold mb-3">
              Витамин C
            </h4>
            <p className="text-[#686F72] text-sm leading-relaxed mb-6">
              Ваши отзывы действуют на врачей как ударная доза витамина C! Вы
              замечаете светлые стороны, дарите надежду другим пациентам и
              помогаете клинике расцветать. Спасибо за ваш позитивный заряд!
            </p>
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
          window.location.href = "/";
        }}
        icon={<LogoutIcon className="w-7 h-7 [&_path]:stroke-[#F5653E]" />}
        title="Выйти из профиля?"
        description="Для продолжения работы потребуется снова войти в аккаунт"
        confirmLabel="Выйти"
        cancelLabel="Отмена"
      />
    </>
  );
}
