import { Toaster } from "react-hot-toast";

import type { Metadata } from "next";
import { Onest } from "next/font/google";

import "./globals.css";

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
    <html lang="en" className={`${onest.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#F2F3F5] lg:bg-white">
        {children}
        <Toaster position="bottom-right" />
      </body>
    </html>
  );
}
