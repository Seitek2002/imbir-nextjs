import type { Metadata } from "next";
import { Onest } from "next/font/google";

import { Providers } from "@/app/providers";

import { MobileBottomNav } from "@/widgets/mobile-bottom-nav";

import "@/app/globals.css";

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
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
        <Providers>
          {children}
          <MobileBottomNav />
        </Providers>
      </body>
    </html>
  );
}
