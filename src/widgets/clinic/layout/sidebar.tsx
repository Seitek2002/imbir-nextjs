"use client";

import { FC, ReactNode, useState } from "react";

import Link from "next/link";

import { LogoutIcon, StarIcon } from "@/shared/assets/icons";
import { useLogout } from "@/shared/lib/useLogout";
import { usePendingClinicAppointments } from "@/shared/lib/usePendingAppointments";
import { useSidebarIndicator } from "@/shared/lib/useSidebarIndicator";
import { ImageWithFallback, NavBadge } from "@/shared/ui";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";

type Props = {
  clinicLogo?: string;
  clinicName: string;
  rating?: number;
};

type MenuItem = {
  exact?: boolean;
  href: string;
  icon: ReactNode;
  label: string;
  // Рядом с подписью — число записей, ждущих подтверждения.
  showPending?: boolean;
};

const MENU_ITEMS: MenuItem[] = [
  {
    href: "/clinic-profile",
    label: "Моя клиника",
    exact: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M4.16667 7.5L10 3.33333L15.8333 7.5V15.8333C15.8333 16.2754 15.6577 16.6993 15.3452 17.0118C15.0326 17.3244 14.6087 17.5 14.1667 17.5H5.83333C5.39131 17.5 4.96738 17.3244 4.65482 17.0118C4.34226 16.6993 4.16667 16.2754 4.16667 15.8333V7.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/clinic-profile/specialists",
    label: "Мои специалисты",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M14.1667 17.5V15.8333C14.1667 14.9493 13.8155 14.1014 13.1904 13.4763C12.5652 12.8512 11.7174 12.5 10.8333 12.5H4.16667C3.28261 12.5 2.43477 12.8512 1.80965 13.4763C1.18453 14.1014 0.833336 14.9493 0.833336 15.8333V17.5M19.1667 17.5V15.8333C19.1662 15.0948 18.9204 14.3773 18.4679 13.7936C18.0154 13.2099 17.3819 12.793 16.6667 12.6083M13.3333 2.60833C14.0503 2.79192 14.6858 3.20892 15.1396 3.7936C15.5935 4.37827 15.8399 5.09736 15.8399 5.8375C15.8399 6.57764 15.5935 7.29673 15.1396 7.8814C14.6858 8.46608 14.0503 8.88308 13.3333 9.06667M10.8333 5.83333C10.8333 7.67428 9.34095 9.16667 7.5 9.16667C5.65905 9.16667 4.16667 7.67428 4.16667 5.83333C4.16667 3.99238 5.65905 2.5 7.5 2.5C9.34095 2.5 10.8333 3.99238 10.8333 5.83333Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/clinic-profile/procedures",
    label: "Мои процедуры",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M15.8333 2.5H4.16667C3.24619 2.5 2.5 3.24619 2.5 4.16667V15.8333C2.5 16.7538 3.24619 17.5 4.16667 17.5H15.8333C16.7538 17.5 17.5 16.7538 17.5 15.8333V4.16667C17.5 3.24619 16.7538 2.5 15.8333 2.5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M13.3333 0.833336V4.16667M6.66667 0.833336V4.16667M2.5 7.5H17.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/clinic-profile/appointments",
    label: "Записи",
    showPending: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M10 5V10L13.3333 11.6667M17.5 10C17.5 14.1421 14.1421 17.5 10 17.5C5.85786 17.5 2.5 14.1421 2.5 10C2.5 5.85786 5.85786 2.5 10 2.5C14.1421 2.5 17.5 5.85786 17.5 10Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/clinic-profile/reviews",
    label: "Отзывы",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M10 1.66667L12.575 6.88334L18.3333 7.72501L14.1667 11.7833L15.15 17.5167L10 14.8083L4.85 17.5167L5.83333 11.7833L1.66667 7.72501L7.425 6.88334L10 1.66667Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/clinic-profile/invites",
    label: "Пригласить врача",
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path
          d="M13.3333 17.5V15.8333C13.3333 14.9493 12.9821 14.1014 12.357 13.4763C11.7319 12.8512 10.884 12.5 10 12.5H4.16667C3.28261 12.5 2.43477 12.8512 1.80964 13.4763C1.18452 14.1014 0.833332 14.9493 0.833332 15.8333V17.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx="7.08333"
          cy="7.08333"
          r="3.33333"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M15.8333 6.66667V11.6667M13.3333 9.16667H18.3333"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export const ClinicSidebar: FC<Props> = ({
  clinicName,
  clinicLogo,
  rating,
}) => {
  const { navRef, indicator, pathname } = useSidebarIndicator();
  const pendingCount = usePendingClinicAppointments();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const handleLogout = useLogout();

  const handleLogoutConfirm = async () => {
    setIsLoggingOut(true);
    try {
      await handleLogout();
      setLogoutOpen(false);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <aside className="w-72 shrink-0 hidden lg:block sticky top-0 h-fit">
      {/* Profile Card — белая рамка с отступом 4px, внутри градиентная подложка */}
      <Link
        href="/clinic-profile"
        className="block bg-white border border-border-soft rounded-3xl p-1 mb-4 hover:border-primary transition-colors"
      >
        <div className="bg-linear-to-b from-[#FFE2DA] to-white rounded-[20px] p-6 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-linear-to-br from-primary to-[#FF8A6B] flex items-center justify-center shrink-0 mb-3 border-2 border-white shadow-sm">
            <ImageWithFallback
              src={clinicLogo}
              alt={clinicName}
              width={80}
              height={80}
              className="w-full h-full object-cover"
              fallback={
                <span className="text-white text-2xl font-bold">
                  {clinicName.charAt(0)}
                </span>
              }
            />
          </div>
          <p className="text-foreground font-semibold text-base truncate max-w-full">
            {clinicName}
          </p>
          {!!rating && rating > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <StarIcon className="w-4 h-4 text-primary" />
              <span className="text-primary text-sm font-medium">{rating}</span>
            </div>
          )}
        </div>
      </Link>

      <nav
        ref={navRef}
        className="bg-white border border-border-soft rounded-3xl p-2 flex flex-col gap-1 mb-4 relative"
      >
        <div
          className="absolute inset-x-2 rounded-2xl bg-primary-tint transition-all duration-200 ease-out pointer-events-none"
          style={{ top: indicator.top, height: indicator.height }}
        />

        {MENU_ITEMS.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              data-active={isActive ? "true" : undefined}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl relative z-10 ${!isActive && "hover:bg-surface"}`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200 ${isActive ? "bg-primary text-white" : "bg-primary-tint text-primary"}`}
              >
                {item.icon}
              </div>
              <span
                className={`flex-1 font-medium text-base transition-colors duration-200 ${isActive ? "text-foreground" : "text-secondary"}`}
              >
                {item.label}
              </span>
              {item.showPending && <NavBadge count={pendingCount} />}
            </Link>
          );
        })}
      </nav>

      {/* Logout — своя рамка + небольшой отступ со всех сторон */}
      <button
        onClick={() => setLogoutOpen(true)}
        className="bg-white border border-border-soft rounded-3xl p-1 w-full group"
      >
        <div className="flex items-center gap-3 px-4 py-3.5 rounded-[20px] text-secondary group-hover:bg-surface transition-colors">
          <div className="w-9 h-9 rounded-xl bg-primary-tint flex items-center justify-center shrink-0 text-primary">
            <LogoutIcon className="w-5 h-5" />
          </div>
          <span className="font-medium text-base">Выйти из профиля</span>
        </div>
      </button>

      <ConfirmDialog
        isOpen={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleLogoutConfirm}
        isLoading={isLoggingOut}
        closeOnConfirm={false}
        icon={<LogoutIcon className="w-7 h-7 text-primary" />}
        title="Выйти из профиля?"
        description="Для продолжения работы потребуется снова войти в аккаунт"
        confirmLabel="Выйти"
        cancelLabel="Отмена"
      />
    </aside>
  );
};
