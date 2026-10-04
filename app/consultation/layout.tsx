import { ReactNode } from "react";

// Стили LiveKit нужны только видеокомнате. Раньше импорт стоял в корневом
// layout, и ~20 КБ блокирующего отрисовку CSS видеозвонков приезжали на
// каждую страницу сайта, включая главную и каталоги.
import "@livekit/components-styles";

import { AuthGuard } from "@/shared/lib/AuthGuard";
import { InitialAuthProvider } from "@/shared/lib/initialAuthContext";
import { readInitialAuth } from "@/shared/lib/readInitialAuth";

export default async function ConsultationLayout({
  children,
}: {
  children: ReactNode;
}) {
  const initialAuth = await readInitialAuth();

  return (
    <InitialAuthProvider value={initialAuth}>
      <AuthGuard>{children}</AuthGuard>
    </InitialAuthProvider>
  );
}
