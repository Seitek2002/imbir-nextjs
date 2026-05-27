import { Header } from "@/widgets";

export default function Loading() {
  return (
    <main className="min-h-screen bg-[#F2F3F5] flex flex-col relative">
      {/* Десктопный хедер */}
      <div className="hidden md:block">
        <Header />
      </div>

      <div className="flex-1 w-full max-w-[1400px] mx-auto md:px-10 flex flex-col pt-0 md:pt-8 pb-0 md:pb-10">
        <h1 className="text-3xl font-semibold text-[#191A1B] mb-6 hidden md:block">
          Чаты
        </h1>

        <div className="flex flex-1 gap-6 md:h-[calc(100vh-240px)] min-h-[600px] relative">
          {/* === ЛЕВАЯ КОЛОНКА (Скелетон списка) === */}
          <div className="w-full md:w-[340px] lg:w-[380px] flex flex-col gap-4 shrink-0 bg-[#F2F3F5] p-4 md:p-0">
            {/* Поиск и фильтр */}
            <div className="flex gap-2">
              <div className="flex-1 h-[42px] skeleton rounded-full" />
              <div className="size-[42px] skeleton rounded-full shrink-0" />
            </div>

            {/* Список чатов */}
            <div className="flex-1 flex flex-col gap-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-transparent"
                >
                  <div className="size-12 rounded-full skeleton shrink-0" />
                  <div className="flex-1 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <div className="h-4 w-1/2 skeleton rounded-md" />
                      <div className="h-3 w-8 skeleton rounded-md" />
                    </div>
                    <div className="h-3 w-3/4 skeleton rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* === ПРАВАЯ КОЛОНКА (Скелетон окна переписки) === */}
          <div className="hidden md:flex flex-1 bg-white border border-[#E3E4E5] rounded-3xl flex-col overflow-hidden">
            {/* Шапка */}
            <div className="flex items-center gap-3 p-4 border-b border-[#E3E4E5]">
              <div className="size-10 rounded-full skeleton shrink-0" />
              <div className="flex flex-col gap-2">
                <div className="h-4 w-32 skeleton rounded-md" />
                <div className="h-3 w-16 skeleton rounded-md" />
              </div>
            </div>

            {/* Сообщения */}
            <div className="flex-1 p-6 flex flex-col gap-6 bg-[#F8F9FA] md:bg-white">
              <div className="h-10 w-64 skeleton rounded-r-2xl rounded-tl-2xl self-start" />
              <div className="h-16 w-80 skeleton rounded-l-2xl rounded-tr-2xl self-end" />
              <div className="h-10 w-48 skeleton rounded-r-2xl rounded-tl-2xl self-start" />
              <div className="h-10 w-56 skeleton rounded-l-2xl rounded-tr-2xl self-end" />
            </div>

            {/* Зона ввода */}
            <div className="p-4 border-t border-[#E3E4E5] flex gap-2 items-center">
              <div className="flex-1 h-[46px] skeleton rounded-full" />
              <div className="size-[46px] skeleton rounded-full shrink-0" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
