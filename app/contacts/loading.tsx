import { Footer } from "@/widgets/footer";
import { Header } from "@/widgets/header";

export default function Loading() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header title="Контакты" />

      <div className="flex-1 w-full max-w-360 mx-auto px-4 md:px-10 py-10">
        {/* Hero */}
        <div className="rounded-3xl p-8 md:p-12 mb-6 skeleton h-48 md:h-56" />

        {/* Contacts grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {Array.from({ length: 4 }, (_, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-6 flex flex-col gap-3 border border-border"
            >
              <div className="size-12 rounded-2xl skeleton" />
              <div className="h-3 w-1/2 skeleton rounded-md" />
              <div className="flex flex-col gap-1">
                <div className="h-4 w-4/5 skeleton rounded-md" />
                <div className="h-4 w-3/5 skeleton rounded-md" />
              </div>
            </div>
          ))}
        </div>

        {/* Map placeholder */}
        <div className="bg-white rounded-3xl overflow-hidden border border-border mb-6">
          <div className="h-64 md:h-80 skeleton" />
          <div className="p-6 flex flex-col gap-2">
            <div className="h-5 w-40 skeleton rounded-md" />
            <div className="h-4 w-3/4 skeleton rounded-md" />
          </div>
        </div>

        {/* Support + Social */}
        <div className="grid md:grid-cols-2 gap-3">
          {Array.from({ length: 2 }, (_, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-6 border border-border flex flex-col gap-3"
            >
              <div className="h-5 w-40 skeleton rounded-md mb-1" />
              {Array.from({ length: 2 }, (_, j) => (
                <div key={j} className="flex items-center gap-3">
                  <div className="size-8 rounded-xl skeleton shrink-0" />
                  <div className="h-4 w-2/3 skeleton rounded-md" />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="hidden md:block mt-auto">
        <Footer />
      </div>
    </main>
  );
}
