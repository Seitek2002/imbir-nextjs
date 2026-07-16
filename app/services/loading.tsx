import { Footer } from "@/widgets/footer";
import { Header } from "@/widgets/header";

const ServiceCardSkeletonVertical = () => (
  <div className="bg-white rounded-3xl border border-border overflow-hidden flex flex-col h-full">
    <div className="aspect-4/3 w-full skeleton" />
    <div className="flex-1 p-4 flex flex-col gap-2">
      <div className="h-3 w-1/3 skeleton rounded-md" />
      <div className="h-4 w-4/5 skeleton rounded-md" />
      <div className="h-3 w-1/2 skeleton rounded-md" />
      <div className="mt-auto pt-3 border-t border-border-soft flex items-center justify-between gap-3">
        <div className="h-5 w-16 skeleton rounded-md" />
        <div className="h-9 flex-1 skeleton rounded-lg" />
      </div>
    </div>
  </div>
);

const ServiceCardSkeletonHorizontal = () => (
  <div className="bg-white rounded-3xl p-4 flex items-center gap-4 border border-border">
    <div className="w-28 h-28 rounded-2xl skeleton shrink-0" />
    <div className="flex-1 min-w-0 flex flex-col gap-2">
      <div className="h-4 w-4/5 skeleton rounded-md" />
      <div className="h-3 w-1/2 skeleton rounded-md" />
      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="h-5 w-14 skeleton rounded-md" />
        <div className="h-8 w-24 skeleton rounded-lg" />
      </div>
    </div>
  </div>
);

export default function Loading() {
  return (
    <main className="min-h-screen bg-background md:bg-white flex flex-col">
      <Header title="Услуги" />

      <div className="flex-1 w-full max-w-360 mx-auto pb-10">
        {/* Mobile */}
        <div className="md:hidden p-4 flex flex-col gap-2">
          {Array.from({ length: 4 }, (_, i) => (
            <ServiceCardSkeletonHorizontal key={i} />
          ))}
        </div>

        {/* Desktop */}
        <div className="hidden md:block px-10 py-6">
          <div className="max-w-200">
            <div className="h-10 w-32 skeleton rounded-lg mb-4" />
            <div className="h-5 w-3/4 skeleton rounded-md mb-6" />
          </div>

          <div className="grid grid-cols-4 gap-5 items-start">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <div className="h-4 w-16 skeleton rounded-md" />
                <div className="h-12 w-full skeleton rounded-xl" />
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-6">
            <div className="h-8 w-36 skeleton rounded-lg" />
          </div>

          <div className="grid grid-cols-4 gap-5 items-stretch mt-2">
            {Array.from({ length: 8 }, (_, i) => (
              <ServiceCardSkeletonVertical key={i} />
            ))}
          </div>
        </div>
      </div>

      <div className="hidden md:block mt-auto">
        <Footer />
      </div>
    </main>
  );
}
