import { ReactNode } from "react";

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
      {children}
      <div className="hidden md:block">
        <Footer />
      </div>
    </>
  );
}
