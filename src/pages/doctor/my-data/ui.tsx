"use client";

import { FC } from "react";

import { useSearchParams } from "next/navigation";

import {
  MyDataTabsProvider,
  isMyDataTab,
  useMyDataTabs,
} from "@/widgets/doctor/layout";

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

// Вкладка берётся из ?tab= только при первом рендере: дальше её ведёт
// провайдер (он же переписывает адрес через history.replaceState), поэтому
// переключение не дёргает роутер и не перерисовывает кабинет целиком.
export const DoctorMyDataPage: FC = () => {
  const searchParams = useSearchParams();
  const tab = searchParams?.get("tab") ?? null;

  return (
    <MyDataTabsProvider initialTab={isMyDataTab(tab) ? tab : "basic"}>
      <ActiveSection />
    </MyDataTabsProvider>
  );
};
