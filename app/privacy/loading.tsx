import { Footer } from "@/widgets/footer";
import { Header } from "@/widgets/header";

export default function Loading() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <Header title="Политика конфиденциальности" />

      <div className="flex-1 w-full max-w-360 mx-auto px-4 md:px-10 py-10">
        <div className="bg-white rounded-3xl p-6 md:p-12 max-w-3xl mx-auto">
          <div className="mb-8">
            <div className="h-8 w-3/4 skeleton rounded-lg mb-2" />
            <div className="h-3 w-40 skeleton rounded-md" />
          </div>

          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="mb-8 flex flex-col gap-3">
              <div className="h-5 w-1/2 skeleton rounded-md mb-1" />
              <div className="h-3.5 w-full skeleton rounded-md" />
              <div className="h-3.5 w-full skeleton rounded-md" />
              <div className="h-3.5 w-2/3 skeleton rounded-md" />
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
