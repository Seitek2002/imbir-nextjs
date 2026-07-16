import { ReactNode } from "react";

import { AuthGuard } from "@/shared/lib/AuthGuard";
import { Footer } from "@/widgets/footer";
import { Header } from "@/widgets/header";
import { InitialAuthProvider } from "@/shared/lib/initialAuthContext";
import { readInitialAuth } from "@/shared/lib/readInitialAuth";

export default async function ProfileLayout({
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
      <AuthGuard>{children}</AuthGuard>
      <div className="hidden md:block">
        <Footer />
      </div>
    </InitialAuthProvider>
  );
}
