import type { Metadata } from "next";
import { Onest } from "next/font/google";

import "@livekit/components-styles";

import "@/app/globals.css";
import { Providers } from "@/app/providers";

import { getSiteSettings } from "@/shared/api";
import { SiteSettingsProvider } from "@/shared/lib/siteSettingsContext";

const onest = Onest({
  variable: "--font-onest",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "IMBIR",
  description: "Онлайн запись на прием к врачам со всего Кыргызстана",
};

// Корень намеренно НЕ читает cookies(): это динамический API, и вызов отсюда
// делал бы динамическим всё дерево маршрутов — включая /terms, /privacy, /blog
// и прочие страницы без авторизации, которые обязаны оставаться статикой.
// Авторизацию из cookie читают только layout'ы защищённых разделов
// (readInitialAuth + InitialAuthProvider в app/{profile,doctor-profile,
// clinic-profile}/layout.tsx). Публичным страницам достаётся дефолт "гость" из
// InitialAuthContext, а реальное состояние хедера поднимает клиентская
// гидратация (useAuthDisplay).
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Контакты и соцсети для футера. Тянем здесь, а не в самом футере: он
  // стоит и внутри клиентских страниц, где async-компонент не отрендерить.
  // Запрос кешируется на час и не делает дерево динамическим (в отличие от
  // cookies(), см. комментарий выше) — статика остаётся статикой.
  const siteSettings = await getSiteSettings();

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${onest.className} h-full antialiased`}
    >
      <head suppressHydrationWarning>
        {/* Warm up the connection to the API/media host so the first data and
            image requests don't pay DNS + TLS setup. */}
        <link rel="preconnect" href="https://imbir.sino0on.ru" />
        <link rel="dns-prefetch" href="https://imbir.sino0on.ru" />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-background lg:bg-white"
      >
        <SiteSettingsProvider value={siteSettings}>
          <Providers>{children}</Providers>
        </SiteSettingsProvider>
      </body>
    </html>
  );
}
