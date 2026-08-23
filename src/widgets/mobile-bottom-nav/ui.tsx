"use client";

import { FC, SVGProps } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuthStore } from "@/shared/store";

type IconProps = SVGProps<SVGSVGElement>;

const HomeIcon: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path
      d="M3 10.5 12 3l9 7.5M5.25 9v10.5A.75.75 0 0 0 6 20.25h3.75V15a1.5 1.5 0 0 1 1.5-1.5h1.5a1.5 1.5 0 0 1 1.5 1.5v5.25H18a.75.75 0 0 0 .75-.75V9"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SearchTabIcon: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
    <path
      d="m20 20-3.5-3.5"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

const ChatTabIcon: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <path
      d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9a1.5 1.5 0 0 1-1.5 1.5H9l-4 3.5V16H5.5A1.5 1.5 0 0 1 4 14.5v-9Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
);

const ProfileTabIcon: FC<IconProps> = (props) => (
  <svg viewBox="0 0 24 24" fill="none" {...props}>
    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" />
    <path
      d="M4.5 20a7.5 7.5 0 0 1 15 0"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

// Нижняя таб-панель мобильного приложения (Home / Поиск / Чат / Профиль).
// Показывается только на корневых экранах-вкладках и только на узких экранах;
// на десктопе навигация идёт через верхнюю шапку.
export const MobileBottomNav: FC = () => {
  const pathname = usePathname() ?? "";
  const role = useAuthStore((s) => s.user?.role);

  const profileHref =
    role === "doctor"
      ? "/doctor-profile"
      : role === "clinic"
        ? "/clinic-profile/menu"
        : "/profile";

  const items = [
    { href: "/", label: "Home", Icon: HomeIcon },
    { href: "/search", label: "Поиск", Icon: SearchTabIcon },
    { href: "/chat", label: "Чат", Icon: ChatTabIcon },
    {
      href: profileHref,
      label: "Профиль",
      Icon: ProfileTabIcon,
      // Пока роль неизвестна (не залогинен), profileHref всё равно "/profile" —
      // обычный auto-prefetch (эта ссылка всегда в вьюпорте, панель fixed)
      // уйдёт туда ещё до входа, middleware ответит редиректом на /login, и
      // Next закэширует именно его как результат для "/profile". После
      // логина router.push("/profile") (login/ui.tsx) попадает в этот же
      // кэш и остаётся на /login вместо настоящего перехода. Без prefetch
      // такого кэша просто не появляется.
      prefetch: role ? undefined : false,
    },
  ];

  // Панель показываем только на самих вкладках-хабах; на вложенных экранах
  // (настройки, история, детали) её нет — там навигация «назад». Экран чата
  // (/chat) — полноэкранный h-dvh с внутренними панелями, поэтому там панель
  // тоже не рисуем, чтобы не перекрывать поле ввода; вкладка «Чат» при этом
  // остаётся кликабельной с других экранов.
  const showOn = ["/", "/search", profileHref];
  if (!showOn.includes(pathname)) return null;

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-stretch">
        {items.map(({ href, label, Icon, prefetch }) => {
          const active = href === "/" ? pathname === "/" : pathname === href;
          return (
            <Link
              key={label}
              href={href}
              prefetch={prefetch}
              className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 transition-colors ${
                active ? "text-primary" : "text-muted"
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[11px] font-medium leading-none">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
