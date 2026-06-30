import { Suspense } from "react";

import { RegisterPage } from "@/screens/register";

export default function Page() {
  return (
    <Suspense>
      <RegisterPage />
    </Suspense>
  );
}
