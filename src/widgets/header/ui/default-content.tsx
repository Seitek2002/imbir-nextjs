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
import { useAuthStore } from "@/shared/store/authStore";
import { useCityStore } from "@/shared/store/cityStore";

const ROLE_ROUTE: Record<string, string> = {
  patient: "/profile",
  doctor: "/doctor-profile",
  clinic: "/clinic-profile",
};

export const DefaultContent: FC<{ searchable?: boolean }> = ({
  searchable,
}) => {
  const [isCityModalOpen, setIsCityModalOpen] = useState(false);
  const city = useCityStore((state) => state.city);
  const user = useAuthStore((s) => s.user);
  const profileHref = user
    ? (ROLE_ROUTE[user.role] ?? ROUTES.PROFILE)
    : ROUTES.LOGIN;

  return (
    <>
      <div>
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <Link href={ROUTES.HOME}>
              <Logo className="w-26.5 h-6.5" />
            </Link>

            <Button
              IconLeft={GeoIcon}
              IconRight={GeoBtnArrowIcon}
              variant="outline"
              size="sm"
              onClick={() => setIsCityModalOpen(true)}
            >
              {city}
            </Button>
          </div>

          <nav className="hidden md:flex text-foreground text-xs lg:text-base gap-6 items-center">
            <Link href={ROUTES.CLINICS}>Клиники</Link>
            <Link href={ROUTES.SPECIALISTS}>Специалисты</Link>
            <Link href={ROUTES.SERVICES}>Услуги</Link>
            <Link href={ROUTES.BLOG}>Блог</Link>
          </nav>

          {/* Mobile right icons */}
          <div className="flex md:hidden gap-2">
            <Link href={ROUTES.LOGIN}>
              <IconBtn variant="outline" size="sm">
                <ChatIcon className="size-5" />
              </IconBtn>
            </Link>
            <Link href={profileHref}>
              <IconBtn variant="outline" size="sm">
                <ProfileIcon className="size-5" />
              </IconBtn>
            </Link>
          </div>

          <div className="hidden md:flex gap-3">
            <Link href={ROUTES.RECORD}>
              <Button size="sm" className="px-5 whitespace-nowrap">
                Записаться на приём
              </Button>
            </Link>
            <Suspense
              fallback={<div className="size-10 bg-gray-100 rounded-full" />}
            >
              <GlobalSearch />
            </Suspense>
            <Link href={ROUTES.LOGIN}>
              <IconBtn variant="outline" size="sm">
                <ChatIcon className="size-5" />
              </IconBtn>
            </Link>
            <Link href={profileHref}>
              <IconBtn variant="outline" size="sm">
                <ProfileIcon className="size-5" />
              </IconBtn>
            </Link>
          </div>
        </div>

        {searchable && (
          <div className="w-full flex items-center justify-center mt-4 md:hidden">
            <Link
              href={ROUTES.SEARCH()}
              className="flex items-center w-full gap-2 border border-border px-3 py-2 rounded-full transition-transform active:scale-95"
            >
              <SearchIcon className="size-5" />
              <span className="text-secondary text-base">Поиск клиники</span>
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
