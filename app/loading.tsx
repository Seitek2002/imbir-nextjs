import { Header } from "@/widgets/header";

export default function Loading() {
  return (
    <main>
      <Header searchable />

      {/* Hero skeleton — тот же контейнер/пропорции, что и у настоящего Hero */}
      <section className="relative max-w-340 mx-auto mt-6 overflow-hidden rounded-3xl bg-[#FFF0E9] pt-8 px-4 pb-0 md:p-12 md:pb-0 flex flex-col md:block min-h-150">
        <div className="relative z-10 w-full max-w-300 mx-auto h-full flex flex-col md:flex-row justify-between">
          <div className="flex flex-col items-start w-full md:w-1/2 z-20">
            <div className="h-8 md:h-12 w-4/5 skeleton rounded-lg mb-3" />
            <div className="h-8 md:h-12 w-2/3 skeleton rounded-lg mb-5" />
            <div className="h-4 w-full max-w-80 skeleton rounded-md mb-6" />

            <div className="h-11 w-full md:w-70 skeleton rounded-full mb-6 md:mb-16" />

            <div className="border border-border-soft rounded-3xl bg-white p-4 w-full md:w-105 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full skeleton shrink-0" />
                <div className="h-4 w-2/3 skeleton rounded-md" />
              </div>
              <div className="h-10 w-full skeleton rounded-full" />
            </div>
          </div>
        </div>
      </section>

      {/* Специалисты — первый below-hero блок держим eager, как в реальной странице */}
      <div className="max-w-340 mx-auto py-30 px-4">
        <div className="flex items-center justify-between">
          <div className="h-9 w-44 skeleton rounded-xl" />
          <div className="hidden lg:flex gap-2">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="h-9 w-28 skeleton rounded-full" />
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3">
          <div className="flex flex-col gap-2 md:hidden">
            {Array.from({ length: 3 }, (_, i) => (
              <div
                key={i}
                className="h-28 w-full skeleton rounded-2xl border border-border-soft"
              />
            ))}
          </div>
          <div className="hidden md:grid md:grid-cols-4 gap-3">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className="h-70 w-full skeleton rounded-2xl border border-border-soft"
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
