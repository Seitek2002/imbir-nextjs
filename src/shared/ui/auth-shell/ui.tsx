import { ReactNode } from "react";

import Image from "next/image";

type Props = {
  // Содержимое правой карточки (форма конкретной страницы).
  children: ReactNode;
  footer: ReactNode;
  // Хедер и футер приходят пропсами (это виджеты — shared их не импортирует),
  // а их поведение всё равно различается на входе/регистрации.
  header: ReactNode;
};

// Общая оболочка страниц авторизации (вход/регистрация): декоративная картинка
// слева + карточка формы справа. Раньше эта разметка (в т.ч. картинка) дублировалась
// в login/ui.tsx и register/ui.tsx.
export const AuthShell = ({ header, footer, children }: Props) => (
  <main className="min-h-screen bg-background flex flex-col">
    {header}

    <div className="flex-1 w-full max-w-360 md:max-w-340 mx-auto px-4 md:px-10 flex flex-col md:flex-row md:gap-10 pt-4 md:pt-16 pb-10">
      {/* Left decorative panel — desktop only */}
      <div className="hidden md:block md:w-1/2 shrink-0 self-start sticky top-8">
        <div className="rounded-2xl bg-[#FEF3F0] overflow-hidden flex items-center justify-center">
          <div className="relative w-full aspect-square">
            <Image
              // WebP без потерь вместо исходного PNG: пиксели те же (альфа и
              // видимый цвет сверены побитово), но мастер весит 1.1МБ вместо
              // 1.6МБ. Пользователю всё равно уходит вариант от next/image,
              // так что исходник держим несжатым — иначе получится двойное
              // пережатие.
              src="/assets/auth-bg.webp"
              fill
              // Медиа-условие, а не голое "640px": панель скрыта до md, но
              // <img> внутри display:none браузер всё равно грузит — без
              // условия мобильный тянул бы десктопный вариант, которого не
              // увидит. С ним берётся самый мелкий кандидат из srcset.
              sizes="(max-width: 767px) 1px, 640px"
              // Это LCP-элемент страниц входа и регистрации (виден сразу, без
              // скролла). Без priority next/image ставит loading="lazy", и
              // браузер откладывает загрузку — Next ругается об этом в консоли.
              priority
              alt="Imbir"
              className="object-contain"
            />
          </div>
        </div>
      </div>

      {/* Right form card */}
      <div className="flex-1 md:bg-white md:rounded-2xl md:p-10 md:pb-16 flex flex-col max-w-120 md:max-w-none mx-auto w-full">
        <div className="md:contents bg-white rounded-2xl m-2 p-4 md:p-0 flex-1 flex flex-col">
          {children}
        </div>
      </div>
    </div>

    {footer}
  </main>
);
