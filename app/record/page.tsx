import { Suspense } from "react";

import { RecordPage } from "@/pages/record";

import Loading from "./loading";

export default function Page() {
  return (
    // Страница читает адрес через useSearchParams, поэтому в статическую
    // сборку попадает не она сама, а fallback этой границы. Пустой fallback
    // давал пустой HTML: при открытии /record по прямой ссылке экран
    // оставался белым, пока не загрузится и не выполнится весь JS.
    // Скелетон из loading.tsx появляется с первым кадром.
    <Suspense fallback={<Loading />}>
      <RecordPage />
    </Suspense>
  );
}
