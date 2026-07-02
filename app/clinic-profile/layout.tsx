import { ReactNode } from "react";

import { AuthGuard } from "@/shared/lib/AuthGuard";
import { Footer } from "@/widgets/footer";
import { Header } from "@/widgets/header";

export default function ClinicProfileLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <div className="hidden md:block">
        <Header />
      </div>
      <AuthGuard>{children}</AuthGuard>
      <div className="hidden md:block">
        <Footer />
      </div>
    </>
  );
}
