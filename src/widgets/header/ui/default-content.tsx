"use client";
import { FC, Suspense, useState } from "react";

import Link from "next/link";

import { CitySelectorModal, GlobalSearch } from "@/features";
import { Button, IconBtn } from "@/shared";

import {
  ChatIcon,
  GeoBtnArrowIcon,
  GeoIcon,
  Logo,
  ProfileIcon,
  SearchIcon,
} from "@/shared/assets";
import { ROUTES } from "@/shared/config/routes";
import { useCityStore } from "@/shared/store/cityStore";

export const DefaultContent: FC<{ searchable?: boolean }> = ({
  searchable,
}) => {
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const city = useCityStore((state) => state.city); // Читаем город из стора

  return (
    <>
      <div>
        <div className="flex items-center justify-between w-full">
          <Link href={ROUTES.HOME}>
            <Logo className="w-26.5 h-6.5" />
          </Link>

          <nav className="hidden md:flex text-[#191A1B] text-xs lg:text-base gap-6 items-center">
            <Link href={ROUTES.CLINICS}>Клиники</Link>
            <Link href={ROUTES.SPECIALISTS}>Специалисты</Link>
            <Link href={ROUTES.SERVICES}>Услуги</Link>
            <Link href={ROUTES.BLOG}>Блог</Link>
          </nav>

          <div className="hidden md:flex gap-3">
            <Link href={ROUTES.RECORD}>
              <Button size="xs">Записаться на приём</Button>
            </Link>
            <Suspense
              fallback={
                <div className="size-10 bg-gray-100 rounded-full animate-pulse" />
              }
            >
              <GlobalSearch />
            </Suspense>
            <IconBtn variant="outline" size="sm">
              <ChatIcon className="size-5" />
            </IconBtn>
            <IconBtn variant="outline" size="sm">
              <ProfileIcon className="size-5" />
            </IconBtn>
          </div>

          <Button
            IconLeft={GeoIcon}
            IconRight={GeoBtnArrowIcon}
            variant="outline"
            size="sm"
            className="md:hidden"
            onClick={() => setIsCityModalOpen(true)} // ОТКРЫВАЕМ МОДАЛКУ
          >
            {city} {/* ДИНАМИЧЕСКОЕ ИМЯ ГОРОДА ИЗ ZUSTAND */}
          </Button>
        </div>

        {searchable && (
          <div className="w-full flex items-center justify-center mt-4 md:hidden">
            <Link
              href={ROUTES.SEARCH()}
              className="flex items-center w-full gap-2 border border-[#E5E6E8] px-3 py-2 rounded-full transition-transform active:scale-95"
            >
              <SearchIcon className="size-5" />
              <span className="text-[#686F72] text-base">Поиск клиники</span>
            </Link>
          </div>
        )}
      </div>

      {/* РЕНДЕРИМ МОДАЛКУ */}
      <CitySelectorModal
        isOpen={isCityModalOpen}
        onClose={() => setIsCityModalOpen(false)}
      />
    </>
  );
};
