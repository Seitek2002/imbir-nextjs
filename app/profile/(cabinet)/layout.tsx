import { ReactNode } from "react";

import { ProfileSidebar } from "@/widgets/profile/sidebar";

// Постоянный каркас кабинета пациента: заголовок и сайдбар живут в layout и
// не перемонтируются при переключении вкладок — страницы рендерят только свой
// контент, а индикатор меню плавно едет от прежнего пункта к активному.
export default function ProfileCabinetLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="w-full max-w-360 mx-auto md:px-10 md:py-8">
      <h1 className="text-[40px] font-semibold text-foreground mb-8 hidden md:block">
        Мой профиль
      </h1>

      <div className="flex gap-6">
        <aside className="hidden lg:block shrink-0">
          <ProfileSidebar />
        </aside>
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
