import { Footer } from "@/widgets/footer";
import { Header } from "@/widgets/header";

export default function Loading() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header />

      <div className="flex-1 w-full max-w-360 md:max-w-340 mx-auto px-4 md:px-10 flex flex-col md:flex-row md:gap-10 pt-4 md:pt-16 pb-10">
        {/* Left decorative panel — desktop only */}
        <div className="hidden md:block md:w-1/2 shrink-0 self-start sticky top-8">
          <div className="rounded-2xl bg-[#FEF3F0] aspect-square skeleton" />
        </div>

        {/* Right form card */}
        <div className="flex-1 md:bg-white md:rounded-2xl md:p-10 md:pb-16 flex flex-col max-w-120 md:max-w-none mx-auto w-full">
          <div className="md:contents bg-white rounded-2xl m-2 p-4 md:p-0 flex-1 flex flex-col">
            <div className="h-11 w-full skeleton rounded-full mb-4" />

            <div className="mt-8 mb-6 md:mt-12 text-center">
              <div className="h-7 w-1/2 mx-auto skeleton rounded-lg mb-2" />
              <div className="h-4 w-3/4 mx-auto skeleton rounded-md" />
            </div>

            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }, (_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 rounded-2xl border-2 border-border bg-white"
                >
                  <div className="shrink-0 size-12 rounded-full skeleton" />
                  <div className="flex-1 min-w-0 flex flex-col gap-2">
                    <div className="h-4 w-1/3 skeleton rounded-md" />
                    <div className="h-3 w-4/5 skeleton rounded-md" />
                  </div>
                  <div className="shrink-0 size-5 rounded-full skeleton" />
                </div>
              ))}
            </div>

            <div className="mt-auto pt-10 md:mt-10">
              <div className="h-12 md:h-14 w-full skeleton rounded-full" />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
