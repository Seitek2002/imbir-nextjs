import { ReactNode } from "react";

import { Footer, Header } from "@/widgets";

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
      {children}
      <div className="hidden md:block">
        <Footer />
      </div>
    </>
  );
}
