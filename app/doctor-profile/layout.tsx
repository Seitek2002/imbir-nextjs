import { ReactNode } from "react";

import { AuthGuard } from "@/shared/lib/AuthGuard";
import { DoctorPageLayoutSkeleton } from "@/widgets/doctor/layout";
import { Footer } from "@/widgets/footer";
import { Header } from "@/widgets/header";

export default function DoctorProfileLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <div className="hidden md:block">
        <Header />
      </div>
      <AuthGuard>
        <DoctorPageLayoutSkeleton>{children}</DoctorPageLayoutSkeleton>
      </AuthGuard>
      <div className="hidden md:block">
        <Footer />
      </div>
    </>
  );
}
