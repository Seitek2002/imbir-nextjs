import { Header } from "@/widgets/header";

export default function Loading() {
  return (
    <main className="min-h-screen bg-background lg:bg-white flex flex-col">
      <Header title="Оформление записи">
        <div className="flex items-center gap-2 mt-3 md:mt-0">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="h-1.5 flex-1 skeleton rounded-full" />
          ))}
        </div>
      </Header>

      <div className="hidden lg:flex items-center gap-3 w-full max-w-340 mx-auto px-10 pt-6">
        <div className="size-9 skeleton rounded-full" />
        <div className="h-7 w-56 skeleton rounded-lg" />
      </div>

      <div className="w-full max-w-340 mx-auto px-4 lg:px-10 py-4 lg:py-6 pb-10 flex-1">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-6">
          <div className="rounded-3xl border border-border-soft bg-white overflow-hidden p-4 lg:p-6">
            <div className="h-6 w-40 skeleton rounded-md mb-4" />
            <div className="flex flex-col gap-3 max-w-full lg:max-w-75">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <div className="h-3 w-16 skeleton rounded-md" />
                  <div className="h-13 w-full skeleton rounded-xl" />
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="rounded-3xl border border-border-soft bg-white p-5 flex flex-col gap-4">
              <div className="h-5 w-32 skeleton rounded-md" />
              <div className="h-24 w-full skeleton rounded-2xl" />
              <div className="h-10 w-full skeleton rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
