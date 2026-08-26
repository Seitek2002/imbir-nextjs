"use client";

import {
  FC,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from "react";

export const MY_DATA_TABS = [
  { id: "basic", label: "Основная информация" },
  { id: "professional", label: "Профессиональные данные" },
  { id: "education", label: "Образование" },
  { id: "documents", label: "Сертификаты и документы" },
] as const;

export type MyDataTab = (typeof MY_DATA_TABS)[number]["id"];

export const isMyDataTab = (value: null | string): value is MyDataTab =>
  MY_DATA_TABS.some((tab) => tab.id === value);

type ContextValue = {
  // null — раздел не выбран: на мобильном это экран-список «Моих данных»
  // (как в макете), на десктопе списка нет и показывается первая вкладка.
  active: MyDataTab | null;
  setActive: (tab: MyDataTab | null) => void;
};

const MyDataTabsContext = createContext<ContextValue | null>(null);

export const useMyDataTabs = () => {
  const context = useContext(MyDataTabsContext);
  if (!context) {
    throw new Error("useMyDataTabs вне MyDataTabsProvider");
  }
  return context;
};

// Раньше каждая вкладка «Моих данных» была отдельным маршрутом, а «табы» —
// ссылками: клик перезапускал страницу целиком (ремоунт формы, скачок к
// верху, мигание layout'а). Теперь это настоящие табы — переключение идёт
// состоянием, а в адресной строке остаётся ?tab=… через history.replaceState:
// ссылку по-прежнему можно скинуть или обновить, но без навигации Next.
export const MyDataTabsProvider: FC<{
  children: ReactNode;
  initialTab: MyDataTab | null;
}> = ({ initialTab, children }) => {
  const [active, setActiveState] = useState<MyDataTab | null>(initialTab);

  const setActive = useCallback((tab: MyDataTab | null) => {
    setActiveState(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (tab) url.searchParams.set("tab", tab);
      else url.searchParams.delete("tab");
      window.history.replaceState(null, "", url);
    }
  }, []);

  return (
    <MyDataTabsContext value={{ active, setActive }}>
      {children}
    </MyDataTabsContext>
  );
};

// Раньше здесь же был десктопный DoctorMyDataTabs (переключатель разделов
// пилюлями) — убран вместе с переходом десктопа на общий скролл со всеми
// разделами (см. pages/doctor/my-data/overview.tsx), как в /clinic-profile.
