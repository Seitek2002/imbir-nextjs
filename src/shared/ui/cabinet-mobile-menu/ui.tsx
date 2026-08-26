"use client";

import { FC, ReactNode, useState } from "react";

import Link from "next/link";

import { LogoutIcon } from "@/shared/assets/icons";
import { useLogout } from "@/shared/lib/useLogout";
import { ConfirmDialog } from "@/shared/ui/confirm-dialog";

export type CabinetMenuItem = {
  href: string;
  icon: ReactNode;
  label: string;
};

type Props = {
  // Содержимое аватар-круга: <img>/<Image> или буква-инициал.
  avatar: ReactNode;
  // Блок между карточкой профиля и меню (напр. плитки статистики у врача).
  beforeMenu?: ReactNode;
  // Блок под кнопкой выхода (напр. карточка статуса у пациента).
  footer?: ReactNode;
  // В клиническом кабинете заголовок — отдельная белая верхняя карточка.
  headerVariant?: "card" | "plain";
  items: CabinetMenuItem[];
  name: string;
  // Строка под именем (рейтинг, специальность и т.п.).
  subtitle?: ReactNode;
  // Заголовок экрана (по умолчанию «Мой профиль»).
  title?: string;
};

const Chevron = () => (
  <svg
    className="w-5 h-5 text-dim shrink-0"
    fill="none"
    viewBox="0 0 20 20"
    aria-hidden
  >
    <path
      d="M7.5 15L12.5 10L7.5 5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// Мобильный экран-меню личного кабинета — общий для всех ролей (пациент/врач/
// клиника). Отличается только пунктами, аватаром и доп-блоками, которые
// приходят пропсами. Выход из профиля (с подтверждением) встроен.
export const CabinetMobileMenu: FC<Props> = ({
  title = "Мой профиль",
  headerVariant = "plain",
  avatar,
  name,
  subtitle,
  items,
  beforeMenu,
  footer,
}) => {
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
    <>
      <div className="min-h-screen bg-[#FAFAFA]">
        {/* pb под фиксированную нижнюю таб-панель (на мобильном) */}
        <div className="px-4 pt-6 pb-24 lg:pb-6">
          {headerVariant === "card" ? (
            <div className="-mx-4 -mt-6 mb-3 rounded-b-3xl bg-white px-4 pt-6 pb-4">
              <h1 className="text-2xl font-semibold text-foreground">
                {title}
              </h1>
            </div>
          ) : (
            <h1 className="text-2xl font-semibold text-foreground mb-6">
              {title}
            </h1>
          )}

          {/* Профиль — белая рамка с отступом 4px, внутри градиентная подложка */}
          <div className="bg-white border border-border-soft rounded-3xl p-1 mb-4">
            <div className="bg-linear-to-b from-[#FFE2DA] to-white rounded-[20px] p-6 flex flex-col items-center gap-3">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-linear-to-br from-primary to-[#FF8A6B] flex items-center justify-center">
                {avatar}
              </div>
              <div className="text-center">
                <h2 className="text-foreground font-semibold text-lg">
                  {name}
                </h2>
                {subtitle}
              </div>
            </div>
          </div>

          {beforeMenu}

          {/* Меню */}
          <nav className="bg-white rounded-3xl p-2 flex flex-col gap-1 mb-4">
            {items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 px-4 py-3.5 rounded-2xl hover:bg-surface transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-primary-tint flex items-center justify-center shrink-0 text-primary [&_path]:stroke-primary">
                  {item.icon}
                </div>
                <span className="flex-1 font-medium text-base text-foreground">
                  {item.label}
                </span>
                <Chevron />
              </Link>
            ))}
          </nav>

          {/* Выход */}
          <button
            onClick={() => setLogoutOpen(true)}
            className="bg-white rounded-3xl px-6 py-4 flex items-center gap-3 text-secondary hover:bg-surface transition-colors w-full mb-6"
          >
            <div className="w-9 h-9 rounded-xl bg-primary-tint flex items-center justify-center shrink-0">
              <LogoutIcon className="w-5 h-5 [&_path]:stroke-primary" />
            </div>
            <span className="flex-1 text-left font-medium text-base">
              Выйти из профиля
            </span>
            <Chevron />
          </button>

          {footer}
        </div>
      </div>

      <ConfirmDialog
        isOpen={logoutOpen}
        onClose={() => setLogoutOpen(false)}
        onConfirm={handleLogoutConfirm}
        isLoading={isLoggingOut}
        closeOnConfirm={false}
        icon={<LogoutIcon className="w-7 h-7 [&_path]:stroke-primary" />}
        title="Выйти из профиля?"
        description="Для продолжения работы потребуется снова войти в аккаунт"
        confirmLabel="Выйти"
        cancelLabel="Отмена"
      />
    </>
  );
};
