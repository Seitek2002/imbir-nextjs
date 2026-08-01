import { Suspense } from "react";

import { DoctorMyDataPage } from "@/pages/doctor/my-data";

export default function Page() {
  return (
    <Suspense>
      <DoctorMyDataPage />
    </Suspense>
  );
}
