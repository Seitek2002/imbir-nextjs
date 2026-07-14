"use client";

import { FC, ReactNode } from "react";

import { useRouter } from "next/navigation";

import { HeaderBackIcon } from "@/shared/assets/icons";
import { cn } from "@/shared/lib/utils";
import { IconBtn } from "@/shared/ui";

type Props = {
  // Заголовок страницы в мобильной шапке.
  title: string;
  // Больше не используется: крупный desktop-h1 («Мой профиль») рендерит
  // постоянный ClinicPageLayoutSkeleton в app/clinic-profile/layout.tsx.
  desktopTitle?: string;
  // Правый слот мобильной шапки (кнопки «Добавить»/«Пригласить» и т.п.).
  mobileAction?: ReactNode;
  // Доп-классы для контентной обёртки (напр. "flex flex-col gap-6").
  mainClassName?: string;
  children: ReactNode;
};

// Пер-страничная часть кабинета клиники: мобильная шапка + контент.
// Контейнер, h1 и сайдбар живут в постоянном ClinicPageLayoutSkeleton
// (route-layout), чтобы не перемонтироваться при переключении вкладок.
export const ClinicPageLayout: FC<Props> = ({
  title,
  mobileAction,
  mainClassName,
  children,
}) => {
  const router = useRouter();

  return (
    <>
      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between px-4 py-4 bg-white border-b border-border">
        <IconBtn
          onClick={() => router.back()}
          variant="text"
          size="sm"
          aria-label="Назад"
        >
          <HeaderBackIcon className="w-5 h-5" />
        </IconBtn>
        <h1 className="text-base font-semibold text-foreground truncate mx-2">
          {title}
        </h1>
        {mobileAction ?? <div className="w-10" />}
      </div>

      <div className={cn("px-4 py-4 md:p-0", mainClassName)}>{children}</div>
    </>
  );
};
