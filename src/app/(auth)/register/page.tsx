import { Suspense } from "react";

import { RegisterPage } from "@/views";

export default function Page() {
  return (
    <Suspense>
      <RegisterPage />
    </Suspense>
  );
}
