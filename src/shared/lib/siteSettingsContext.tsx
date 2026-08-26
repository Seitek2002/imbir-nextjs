"use client";

import { ReactNode, createContext, useContext } from "react";

import type { SiteSettings } from "@/shared/api";

// Настройки сайта, прочитанные на сервере в корневом layout и розданные вниз.
//
// Почему через контекст, а не запросом в самом футере: футер стоит на 24
// страницах, и шесть из них — клиентские компоненты, поэтому сделать сам
// футер серверным async-компонентом нельзя. Клиентский запрос дал бы моргание
// (сначала фолбэк, потом настоящие контакты) и лишний поход в сеть на каждой
// вкладке. Тот же приём уже используется для авторизации — см.
// initialAuthContext.
//
// null означает «настройки не получены» (бэк недоступен или поле пустое) —
// потребитель обязан иметь свой фолбэк.
const SiteSettingsContext = createContext<null | SiteSettings>(null);

export const SiteSettingsProvider = ({
  value,
  children,
}: {
  children: ReactNode;
  value: null | SiteSettings;
}) => <SiteSettingsContext value={value}>{children}</SiteSettingsContext>;

export const useSiteSettings = () => useContext(SiteSettingsContext);
