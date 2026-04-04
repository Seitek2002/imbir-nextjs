import { Suspense } from "react";

import { HomePage } from "@/views/home";

// Твой путь до HomePage

export default function Page() {
  return (
    // Оборачиваем всю страницу.
    // Fallback можно оставить пустым или сделать скелетон на весь экран
    <Suspense
      fallback={<main className="min-h-screen bg-[#F2F3F5] animate-pulse" />}
    >
      <HomePage />
    </Suspense>
  );
}
