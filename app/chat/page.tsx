import { Suspense } from "react";

import { ChatPage } from "@/pages/chat";

// ChatPage читает параметры входа (?ask/?ai/?room) через useSearchParams —
// на статически пререндеренном маршруте это требует Suspense-границы.
export default function Page() {
  return (
    <Suspense>
      <ChatPage />
    </Suspense>
  );
}
