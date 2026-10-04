import { Suspense } from "react";

import { RegisterPage } from "@/pages/register";

import Loading from "./loading";

export default function Page() {
  return (
    // Страница читает адрес через useSearchParams, поэтому в статическую
    // сборку попадает не она сама, а fallback этой границы. Пустой fallback
    // давал пустой HTML: до загрузки JS на экране не было ничего, а потом
    // появившаяся форма сдвигала всё, что ниже (CLS 0.56 на /register).
    // Тот же скелетон, что и в loading.tsx, держит место с первого кадра.
    <Suspense fallback={<Loading />}>
      <RegisterPage />
    </Suspense>
  );
}
