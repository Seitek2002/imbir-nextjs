import { ReactNode } from "react";

import { cookies } from "next/headers";

import {
  type InitialAuth,
  InitialAuthProvider,
} from "@/shared/lib/initialAuthContext";
import type { UserRole } from "@/shared/store";
import { Footer } from "@/widgets/footer";
import { Header } from "@/widgets/header";

// Общий layout защищённых разделов (profile / doctor-profile / clinic-profile).
// Только эти маршруты читают cookies() → только они становятся ƒ Dynamic;
// весь остальной сайт остаётся статическим (см. корневой app/layout.tsx).
//
// Capacitor (output: 'export') не допускает динамических функций и вообще не
// имеет сервера, читающего запрос. Помечаем мобильную сборку флагом
// NEXT_PUBLIC_BUILD_TARGET=capacitor — он build-time константа (NEXT_PUBLIC_*
// инлайнится литералом), поэтому в capacitor-сборке ветка ниже не доходит до
// cookies(): Next при пререндере не видит динамического API → раздел остаётся
// статически экспортируемым, а состояние авторизации целиком поднимает
// клиентская гидратация (AuthGuard + useAuthDisplay).
const readInitialAuth = async (): Promise<InitialAuth> => {
  if (process.env.NEXT_PUBLIC_BUILD_TARGET === "capacitor") {
    return { isAuthed: false };
  }

  // Cookie, которые authStore пишет в паре с состоянием стора (см.
  // src/shared/store/authStore.ts) — серверный "снимок" авторизации до
  // гидратации persist-стора. Токена тут нет — только факт входа и роль.
  const cookieStore = await cookies();
  return {
    isAuthed: cookieStore.get("is_authed")?.value === "1",
    role: cookieStore.get("role")?.value as UserRole | undefined,
  };
};

export default async function ProtectedLayout({
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
      {children}
      <div className="hidden md:block">
        <Footer />
      </div>
    </InitialAuthProvider>
  );
}
