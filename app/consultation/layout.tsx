import { ReactNode } from "react";

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
