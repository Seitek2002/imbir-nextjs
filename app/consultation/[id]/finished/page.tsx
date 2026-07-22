import Link from "next/link";

import { readInitialAuth } from "@/shared/lib/readInitialAuth";

export default async function ConsultationFinishedPage() {
  const { role } = await readInitialAuth();
  const appointmentsHref =
    role === "doctor"
      ? "/doctor-profile/appointments"
      : role === "clinic"
        ? "/clinic-profile/appointments"
        : "/profile/history";

  return (
    <main className="min-h-dvh grid place-content-center justify-items-center bg-[#0d0d12] text-white px-6 text-center">
      <div className="grid size-16 place-items-center rounded-full bg-primary/15 text-primary text-3xl">
        ✓
      </div>
      <h1 className="mt-5 text-2xl md:text-3xl font-semibold">
        Консультация завершена
      </h1>
      <p className="mt-2 max-w-md text-[#a9adb5]">
        Вы отключились от видеокомнаты. Спасибо, что воспользовались IMBIR.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link
          href={appointmentsHref}
          className="min-h-12 inline-flex items-center rounded-full bg-primary px-6 font-medium"
        >
          К истории записей
        </Link>
        <Link
          href="/"
          className="min-h-12 inline-flex items-center rounded-full border border-white/15 px-6 font-medium"
        >
          На главную
        </Link>
      </div>
    </main>
  );
}
