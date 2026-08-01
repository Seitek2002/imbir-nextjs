"use client";

import { FC } from "react";

import { useSearchParams } from "next/navigation";

import {
  MyDataTabsProvider,
  isMyDataTab,
  useMyDataTabs,
} from "@/widgets/doctor/layout";

import { DoctorMyDataList } from "./list";
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
// без media-запросов в JS, чтобы не ловить скачок после гидратации:
//  • раздел не выбран — на мобильном это экран-список разделов (макет),
//    а на десктопе списка нет, там сразу первая вкладка;
//  • раздел выбран — экран раздела виден на обеих ширинах.
const MyDataScreen: FC = () => {
  const { active } = useMyDataTabs();

  return (
    <>
      {active === null && (
        <div className="lg:hidden">
          <DoctorMyDataList />
        </div>
      )}
      <div className={active === null ? "hidden lg:block" : undefined}>
        <ActiveSection />
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
