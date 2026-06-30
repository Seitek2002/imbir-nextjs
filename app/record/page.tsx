import { Suspense } from "react";

import { RecordPage } from "@/pages/record";

export default function Page() {
  return (
    <Suspense>
      <RecordPage />
    </Suspense>
  );
}
