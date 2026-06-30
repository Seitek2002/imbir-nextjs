import { Suspense } from "react";

import { RecordPage } from "@/screens/record";

export default function Page() {
  return (
    <Suspense>
      <RecordPage />
    </Suspense>
  );
}
