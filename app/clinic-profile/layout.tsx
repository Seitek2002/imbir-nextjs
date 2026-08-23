import { ReactNode } from "react";

import { ClinicPageLayoutSkeleton } from "@/widgets/clinic/layout";
import { Footer } from "@/widgets/footer";
import { Header } from "@/widgets/header";

import { AuthGuard } from "@/shared/lib/AuthGuard";
import { InitialAuthProvider } from "@/shared/lib/initialAuthContext";
import { readInitialAuth } from "@/shared/lib/readInitialAuth";

export default async function ClinicProfileLayout({
  children,
}: {
  children: ReactNode;
}) {
  const initialAuth = await readInitialAuth();

  return (
    <InitialAuthProvider value={initialAuth}>
      <div className="hidden md:block">
        <Header />
      </div>
      <AuthGuard>
        <ClinicPageLayoutSkeleton>{children}</ClinicPageLayoutSkeleton>
      </AuthGuard>
      {/* mt-auto прибивает футер к низу: body — flex-колонка на всю высоту
          (см. app/layout.tsx), а шапка/контент/футер лежат в ней соседями и
          сами не растягиваются. Без этого на коротких страницах кабинета
          (пустое «Сохранённое», «Отзывы») футер вставал сразу под контентом,
          а под ним оставалась полоса пустоты до конца экрана. */}
      <div className="hidden md:block mt-auto">
        <Footer />
      </div>
    </InitialAuthProvider>
  );
}
