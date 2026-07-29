import { ReactNode } from "react";

import { DoctorPageLayoutSkeleton } from "@/widgets/doctor/layout";
import { Footer } from "@/widgets/footer";
import { Header } from "@/widgets/header";

import { AuthGuard } from "@/shared/lib/AuthGuard";
import { InitialAuthProvider } from "@/shared/lib/initialAuthContext";
import { readInitialAuth } from "@/shared/lib/readInitialAuth";

export default async function DoctorProfileLayout({
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
        <DoctorPageLayoutSkeleton>{children}</DoctorPageLayoutSkeleton>
      </AuthGuard>
      <div className="hidden md:block">
        <Footer />
      </div>
    </InitialAuthProvider>
  );
}
