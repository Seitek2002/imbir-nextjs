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
      <div className="md:hidden bg-white px-4 pt-1 pb-4">
        <div className="grid grid-cols-[2.5rem_minmax(0,1fr)_2.5rem] items-center min-h-10">
          <IconBtn
            onClick={() => router.back()}
            variant="outline"
            size="sm"
            className="justify-self-start"
            aria-label="Назад"
          >
            <HeaderBackIcon className="size-4" />
          </IconBtn>
          <h1 className="text-center font-medium text-base text-foreground truncate px-2">
            {title}
          </h1>
          <div className="flex justify-end">{mobileAction}</div>
        </div>
      </div>

      <div className={cn("px-4 pt-4 pb-6 md:p-0", mainClassName)}>
        {children}
      </div>
    </>
  );
};
