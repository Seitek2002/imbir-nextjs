import { ReactNode } from "react";

import Image from "next/image";

type Props = {
  // Хедер и футер приходят пропсами (это виджеты — shared их не импортирует),
  // а их поведение всё равно различается на входе/регистрации.
  header: ReactNode;
  footer: ReactNode;
  // Содержимое правой карточки (форма конкретной страницы).
  children: ReactNode;
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
              src="/assets/auth-bg.png"
              fill
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
