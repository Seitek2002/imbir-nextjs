import { ReactNode } from "react";

import { AuthGuard } from "@/shared/lib/AuthGuard";

// Header/Footer и InitialAuthProvider теперь в общем app/(protected)/layout.tsx.
// Здесь остаётся только клиентский гейт редиректа на /login.
export default function ProfileLayout({ children }: { children: ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
