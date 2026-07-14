import { Header } from "@/widgets/header";

export default function Loading() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header />

      <div className="flex-1 w-full max-w-360 md:max-w-340 mx-auto px-4 md:px-10 flex flex-col md:flex-row md:gap-10 pt-4 md:pt-16 pb-10">
        {/* --- ЛЕВАЯ КАРТОЧКА --- */}
        <div className="hidden md:flex md:w-1/2 rounded-2xl p-6 bg-white shrink-0 items-center justify-center">
          <div className="relative w-full aspect-square rounded-xl skeleton" />
        </div>

        {/* --- ПРАВАЯ КАРТОЧКА --- */}
        <div className="flex-1 md:bg-white md:rounded-2xl md:p-10 md:pb-16 flex flex-col max-w-120 md:max-w-none mx-auto w-full">
          <div className="md:contents bg-white rounded-2xl m-2 p-4 md:p-0 flex-1 flex flex-col">
            <div className="hidden md:block size-10 skeleton rounded-full mb-6" />

            <div className="mt-4 mb-6 md:mt-0">
              <div className="h-7 w-2/3 skeleton rounded-lg mb-2" />
              <div className="h-4 w-4/5 skeleton rounded-md" />
            </div>

            <div className="h-14 w-full skeleton rounded-xl" />

            <div className="mt-auto pt-10 md:mt-10">
              <div className="h-12 md:h-14 w-full skeleton rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
