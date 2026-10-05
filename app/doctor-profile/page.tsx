"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { DoctorProfileMobileHub } from "@/pages/doctor/profile";

import { useIsDesktopCabinet } from "@/shared/lib/useIsDesktopCabinet";

// Единый вход в кабинет врача (как /profile у пациента). Раньше здесь стоял
// безусловный redirect на /doctor-profile/my-data — на мобильном это уводило
// с хаб-меню сразу в форму, а попасть в записи, услуги или отзывы было
// неоткуда: сайдбар с этими пунктами есть только на десктопе.
//  • на узком экране (< lg) показываем мобильное хаб-меню;
//  • на десктопе разворачиваем двухколоночный кабинет — уводим в «Мои данные»,
//    где слева тот же список разделов.
//
// На десктопе хаб не монтируем вообще. Раньше он рендерился скрытым (lg:hidden)
// на тот миг, пока не сработает перенаправление: каждый клик по иконке
// профиля в шапке впустую рисовал меню и грузил аватар, который никто не
// увидит.
export default function Page() {
  const router = useRouter();
  const isDesktop = useIsDesktopCabinet();

  useEffect(() => {
    if (isDesktop) router.replace("/doctor-profile/my-data");
  }, [isDesktop, router]);

  if (isDesktop) return null;

  return (
    <div className="lg:hidden">
      <DoctorProfileMobileHub />
    </div>
  );
}
