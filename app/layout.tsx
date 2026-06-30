import type { Metadata } from "next";
import { Onest } from "next/font/google";

import { Providers } from "@/app/providers";

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
      <head suppressHydrationWarning />
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-background lg:bg-white"
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
