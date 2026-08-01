"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { DoctorProfileMobileHub } from "@/pages/doctor/profile";

// Единый вход в кабинет врача (как /profile у пациента). Раньше здесь стоял
// безусловный redirect на /doctor-profile/my-data — на мобильном это уводило
// с хаб-меню сразу в форму, а попасть в записи, услуги или отзывы было
// неоткуда: сайдбар с этими пунктами есть только на десктопе.
//  • на узком экране (< lg) показываем мобильное хаб-меню;
//  • на десктопе разворачиваем двухколоночный кабинет — уводим в «Мои данные»,
//    где слева тот же список разделов.
export default function Page() {
  const router = useRouter();

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const toCabinet = () => {
      if (desktop.matches) router.replace("/doctor-profile/my-data");
    };
    // Проверяем при входе и при изменении ширины (ресайз окна / дев-тулзы).
    toCabinet();
    desktop.addEventListener("change", toCabinet);
    return () => desktop.removeEventListener("change", toCabinet);
  }, [router]);

  return (
    <div className="lg:hidden">
      <DoctorProfileMobileHub />
    </div>
  );
}
