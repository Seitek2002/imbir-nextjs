"use client";

import { FC } from "react";

import { useSearchParams } from "next/navigation";

import {
  MyDataTabsProvider,
  isMyDataTab,
  useMyDataTabs,
} from "@/widgets/doctor/layout";

import { DoctorMyDataList } from "./list";
import { DoctorMyDataOverview } from "./overview";
import { DoctorBasicInfoSection } from "./sections/basic";
import { DoctorDocumentsSection } from "./sections/documents";
import { DoctorEducationSection } from "./sections/education";
import { DoctorProfessionalInfoSection } from "./sections/professional";

const ActiveSection: FC = () => {
  const { active } = useMyDataTabs();

  switch (active) {
    case "professional":
      return <DoctorProfessionalInfoSection />;
    case "education":
      return <DoctorEducationSection />;
    case "documents":
      return <DoctorDocumentsSection />;
    default:
      return <DoctorBasicInfoSection />;
  }
};

// Мобильный и десктопный сценарии расходятся, и разводим их только классами —
// без media-запросов в JS, чтобы не ловить скачок после гидратации.
// Мобильный (как в макете): раздел не выбран — экран-список разделов
// (DoctorMyDataList), раздел выбран — экран этого раздела на весь экран.
// Десктоп (как в ЛК клиники, /clinic-profile): один общий скролл со всеми
// разделами сразу и одним «Редактировать/Сохранить» — на activeTab не
// смотрит, из мобильного `?tab=` не переключается.
const MyDataScreen: FC = () => {
  const { active } = useMyDataTabs();

  return (
    <>
      <div className="lg:hidden">
        {active === null ? <DoctorMyDataList /> : <ActiveSection />}
      </div>
      <div className="hidden lg:block">
        <DoctorMyDataOverview />
      </div>
    </>
  );
};

// Вкладка берётся из ?tab= только при первом рендере: дальше её ведёт
// провайдер (он же переписывает адрес через history.replaceState), поэтому
// переключение не дёргает роутер и не перерисовывает кабинет целиком.
// Без ?tab= раздел не выбран — см. MyDataScreen.
export const DoctorMyDataPage: FC = () => {
  const searchParams = useSearchParams();
  const tab = searchParams?.get("tab") ?? null;

  return (
    <MyDataTabsProvider initialTab={isMyDataTab(tab) ? tab : null}>
      <MyDataScreen />
    </MyDataTabsProvider>
  );
};
