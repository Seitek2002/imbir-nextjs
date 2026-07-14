"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { ProfileMobileHub } from "@/pages/profile/menu";

// Единый вход в кабинет пациента. Это одна страница, а не отдельный «хаб»:
//  • на узком экране (< lg) показываем мобильный хаб-меню, как в макете;
//  • на десктопе разворачиваем двухколоночный кабинет — редиректим на
//    настройки (/profile/my-data), где есть сайдбар с теми же пунктами.
export default function ProfilePage() {
  const router = useRouter();

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const toCabinet = () => {
      if (desktop.matches) router.replace("/profile/my-data");
    };
    // Проверяем при входе и при изменении ширины (ресайз окна / дев-тулзы):
    // как только экран становится десктопным, уводим в двухколоночный кабинет.
    toCabinet();
    desktop.addEventListener("change", toCabinet);
    return () => desktop.removeEventListener("change", toCabinet);
  }, [router]);

  return (
    <div className="lg:hidden">
      <ProfileMobileHub />
    </div>
  );
}
