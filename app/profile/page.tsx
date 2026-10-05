"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { ProfileMobileHub } from "@/pages/profile/menu";

import { useIsDesktopCabinet } from "@/shared/lib/useIsDesktopCabinet";

// Единый вход в кабинет пациента. Это одна страница, а не отдельный «хаб»:
//  • на узком экране (< lg) показываем мобильный хаб-меню, как в макете;
//  • на десктопе разворачиваем двухколоночный кабинет — редиректим на
//    настройки (/profile/my-data), где есть сайдбар с теми же пунктами.
//
// На десктопе хаб не монтируем вообще — см. тот же комментарий в
// app/doctor-profile/page.tsx: скрытый хаб рисовался впустую на миг перед
// перенаправлением.
export default function ProfilePage() {
  const router = useRouter();
  const isDesktop = useIsDesktopCabinet();

  useEffect(() => {
    if (isDesktop) router.replace("/profile/my-data");
  }, [isDesktop, router]);

  if (isDesktop) return null;

  return (
    <div className="lg:hidden">
      <ProfileMobileHub />
    </div>
  );
}
