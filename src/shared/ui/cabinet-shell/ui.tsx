import { ReactNode } from "react";

type Props = {
  // Desktop-заголовок кабинета (напр. «Мой профиль»); на мобильном скрыт.
  title: string;
  // Сайдбар кабинета (у каждой роли свой виджет — передаётся слотом, чтобы
  // shared не импортировал widgets).
  sidebar: ReactNode;
  // Контент страницы (то, что раньше лежало внутри <main>).
  children: ReactNode;
  // Полноширинная мобильная шапка страницы (со своим тайтлом и действиями).
  mobileHeader?: ReactNode;
};

// Общая оболочка страниц личного кабинета (пациент/врач/клиника): контейнер +
// заголовок + сайдбар слева + контент справа. Раньше эта разметка дублировалась
// на каждой странице кабинета.
export const CabinetShell = ({
  title,
  sidebar,
  children,
  mobileHeader,
}: Props) => (
  <>
    {mobileHeader}

    <div className="w-full max-w-360 mx-auto px-4 md:px-10 py-8">
      <h1 className="text-[40px] font-semibold text-foreground mb-8 hidden md:block">
        {title}
      </h1>

      <div className="flex gap-6">
        <aside className="hidden lg:block shrink-0">{sidebar}</aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  </>
);
