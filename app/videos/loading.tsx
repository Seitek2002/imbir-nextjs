import { Footer } from "@/widgets/footer";
import { Header } from "@/widgets/header";

export default function Loading() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header title="Интервью" />

      <div className="flex-1 w-full max-w-360 mx-auto px-4 md:px-10 py-10">
        <div className="mb-8">
          <div className="h-9 w-2/3 md:w-1/3 skeleton rounded-lg mb-3" />
          <div className="h-5 w-4/5 md:w-1/2 skeleton rounded-md" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl overflow-hidden border border-border"
            >
              <div className="aspect-video skeleton" />
              <div className="p-4 flex flex-col gap-3">
                <div className="h-4 w-full skeleton rounded-md" />
                <div className="h-4 w-2/3 skeleton rounded-md" />
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-full skeleton shrink-0" />
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="h-3 w-3/4 skeleton rounded-md" />
                    <div className="h-3 w-1/2 skeleton rounded-md" />
                  </div>
                </div>
              </div>
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
