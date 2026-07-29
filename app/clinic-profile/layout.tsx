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
      <div className="hidden md:block">
        <Footer />
      </div>
    </InitialAuthProvider>
  );
}
