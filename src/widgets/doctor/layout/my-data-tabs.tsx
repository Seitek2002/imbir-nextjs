"use client";

import {
  FC,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from "react";

export const MY_DATA_TABS = [
  { id: "basic", label: "Основная информация" },
  { id: "professional", label: "Профессиональные данные" },
  { id: "education", label: "Образование" },
  { id: "documents", label: "Сертификаты и документы" },
] as const;

export type MyDataTab = (typeof MY_DATA_TABS)[number]["id"];

export const isMyDataTab = (value: string | null): value is MyDataTab =>
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
  initialTab: MyDataTab | null;
  children: ReactNode;
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

// Вкладки — только десктопные: на мобильном по макету разделы открываются
// с экрана-списка «Мои данные» (DoctorMyDataList), а не переключаются табами.
export const DoctorMyDataTabs: FC = () => {
  const { active, setActive } = useMyDataTabs();
  // Раздел не выбран — на десктопе показывается первая вкладка, её и
  // подсвечиваем.
  const current = active ?? MY_DATA_TABS[0].id;
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  // Стрелками ходим по вкладкам, как ожидается от роли tablist.
  const handleKeyDown = (event: React.KeyboardEvent, index: number) => {
    const delta =
      event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = (index + delta + MY_DATA_TABS.length) % MY_DATA_TABS.length;
    setActive(MY_DATA_TABS[next].id);
    refs.current[next]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label="Мои данные"
      className="hidden lg:flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none"
    >
      {MY_DATA_TABS.map((tab, index) => {
        const isActive = current === tab.id;
        return (
          <button
            key={tab.id}
            ref={(node) => {
              refs.current[index] = node;
            }}
            type="button"
            role="tab"
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            onClick={() => setActive(tab.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-medium transition-all cursor-pointer ${
              isActive
                ? "bg-primary text-white shadow-xs"
                : "bg-white border border-border text-secondary hover:bg-surface"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
