import { Suspense } from "react";

import { RegisterPage } from "@/pages/register";

export default function Page() {
  return (
    <Suspense>
      <RegisterPage />
    </Suspense>
  );
}
