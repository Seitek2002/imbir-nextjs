"use client";

import { ReactNode } from "react";

import { usePathname, useRouter } from "next/navigation";

import { Footer } from "@/widgets/footer";
import { Header } from "@/widgets/header";

import { ROUTES } from "@/shared/config";
import { AuthShell } from "@/shared/ui";
import { SegmentedControl } from "@/shared/ui/segmented-control";

// Общий layout /login и /register: раньше каждая страница сама собирала
// AuthShell (шапка + декоративная картинка + футер) заново, и переключение
// вкладки было полноценным переходом между роутами — картинка и шапка
// пересоздавались с нуля, из-за чего сайт визуально "мигал". Next.js не
// перемонтирует общий layout при переходе между дочерними страницами одной
// группы, так что теперь эти части остаются на месте, а меняется только
// содержимое формы.
export default function AuthLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const router = useRouter();
  const authMode = pathname.startsWith(ROUTES.REGISTER) ? "register" : "login";

  const AuthTabs = (
    <SegmentedControl
      options={[
        { label: "Вход", value: "login" },
        { label: "Регистрация", value: "register" },
      ]}
      value={authMode}
      onChange={(val) => {
        router.push(val === "register" ? ROUTES.REGISTER : ROUTES.LOGIN);
      }}
    />
  );

  return (
    <AuthShell
      header={<Header backTo={ROUTES.HOME}>{AuthTabs}</Header>}
      footer={<Footer />}
      // Только мастер регистрации держит на мобильном закреплённую панель
      // с кнопками — вход обходится обычной кнопкой в потоке.
      hasFixedBottomBar={authMode === "register"}
    >
      <div className="hidden md:block">{AuthTabs}</div>
      {children}
    </AuthShell>
  );
}
