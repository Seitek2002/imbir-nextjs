import { Suspense } from "react";

import { RecordPage } from "@/views";

export default function Page() {
  return (
    <Suspense>
      <RecordPage />
    </Suspense>
  );
}
