import { Footer, Header } from "@/widgets";

export default function Loading() {
  return (
    <main className="min-h-screen bg-background md:bg-white flex flex-col relative pb-20 md:pb-0">
      {/* Десктопный хедер */}
      <div className="hidden md:block">
        <Header />
      </div>

      <div className="flex-1 w-full max-w-[1400px] mx-auto md:px-10 flex flex-col pt-0 md:pt-6 pb-10">
        {/* Хлебные крошки */}
        <div className="hidden md:flex mb-6 items-center gap-2">
          <div className="h-4 w-48 skeleton rounded" />
        </div>

        {/* --- ОСНОВНОЙ БЛОК --- */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-10">
          {/* Левая колонка / Слайдер */}
          <div className="relative w-full md:w-[500px] lg:w-[600px] shrink-0 flex flex-col gap-4">
            {/* Главное фото */}
            <div className="h-[340px] md:h-[400px] w-full skeleton md:rounded-3xl" />
            {/* Миниатюры (только ПК) */}
            <div className="hidden md:flex gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="size-20 lg:size-24 rounded-2xl skeleton shrink-0"
                />
              ))}
            </div>
          </div>

          {/* Правая колонка / Информация */}
          <div className="flex-1 flex flex-col bg-white rounded-t-3xl md:rounded-none -mt-6 md:mt-0 relative z-10 p-5 md:p-0">
            {/* Заголовок и данные */}
            <div className="mb-6">
              <div className="h-8 md:h-10 w-2/3 md:w-1/2 skeleton rounded-lg mb-3" />
              <div className="h-4 w-1/3 skeleton rounded-md mb-4" />
              <div className="flex flex-col gap-2">
                <div className="h-4 w-1/2 skeleton rounded-md" />
                <div className="h-4 w-1/2 skeleton rounded-md" />
              </div>
            </div>

            {/* Статистика */}
            <div className="flex items-center justify-between md:justify-start md:gap-12 bg-white md:bg-transparent border md:border-none border-border-soft rounded-2xl p-4 md:p-0 mb-8">
              <div className="h-12 w-16 skeleton rounded-lg" />
              <div className="h-12 w-16 skeleton rounded-lg" />
              <div className="h-12 w-16 skeleton rounded-lg" />
            </div>

            {/* Десктопные кнопки */}
            <div className="hidden md:flex gap-4 mb-10">
              <div className="h-14 flex-1 skeleton rounded-xl" />
              <div className="h-14 flex-1 skeleton rounded-xl" />
            </div>

            {/* О клинике и контакты */}
            <div className="flex flex-col gap-8 md:gap-10 border-t border-border-soft md:border-none pt-8 md:pt-0">
              <div className="flex flex-col gap-3">
                <div className="h-6 w-32 skeleton rounded-md" />
                <div className="h-24 w-full skeleton rounded-lg" />
              </div>
              <div className="flex flex-col gap-3">
                <div className="h-6 w-32 skeleton rounded-md mb-2" />
                <div className="h-5 w-48 skeleton rounded-md" />
                <div className="h-5 w-48 skeleton rounded-md" />
                <div className="h-5 w-48 skeleton rounded-md" />
              </div>
            </div>
          </div>
        </div>

        {/* --- СЕКЦИЯ: УСЛУГИ --- */}
        <div className="mt-10 md:mt-20 px-4 md:px-0">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div className="h-8 w-32 skeleton rounded-md" />
            <div className="hidden md:block h-10 w-[300px] skeleton rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white border border-border-soft rounded-2xl p-4 flex flex-col"
              >
                <div className="h-32 skeleton rounded-xl mb-4" />
                <div className="h-5 w-3/4 skeleton rounded mb-2" />
                <div className="h-4 w-1/2 skeleton rounded mb-4" />
                <div className="h-5 w-full skeleton rounded mb-4 mt-auto" />
                <div className="h-10 w-full skeleton rounded-lg" />
              </div>
            ))}
          </div>
        </div>

        {/* --- СЕКЦИЯ: СПЕЦИАЛИСТЫ --- */}
        <div className="mt-10 md:mt-20 px-4 md:px-0">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div className="h-8 w-32 skeleton rounded-md" />
            <div className="hidden md:block h-10 w-[300px] skeleton rounded-full" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white border border-border-soft rounded-2xl p-4 flex flex-col"
              >
                <div className="h-48 skeleton rounded-xl mb-4" />
                <div className="h-5 w-3/4 skeleton rounded mb-2" />
                <div className="h-4 w-1/2 skeleton rounded mb-4" />
                <div className="h-4 w-full skeleton rounded mb-4" />
                <div className="h-10 w-full skeleton rounded-lg mt-auto" />
              </div>
            ))}
          </div>
        </div>

        {/* --- СЕКЦИЯ: ОТЗЫВЫ --- */}
        <div className="mt-10 md:mt-20 mb-10 md:mb-20 px-4 md:px-0">
          <div className="h-8 w-32 skeleton rounded-md mb-6 md:mb-8" />
          <div className="flex flex-col md:flex-row gap-6 md:gap-10">
            <div className="w-full md:w-[320px] shrink-0 flex flex-col gap-5">
              <div className="h-24 w-full skeleton rounded-2xl" />
              <div className="hidden md:block h-64 w-full skeleton rounded-2xl" />
            </div>
            <div className="flex-1 flex flex-col gap-4">
              <div className="h-32 w-full skeleton rounded-2xl" />
              <div className="h-32 w-full skeleton rounded-2xl" />
            </div>
          </div>
        </div>
      </div>

      <div className="hidden md:block">
        <Footer />
      </div>

      {/* Липкая кнопка для мобилки */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-border-soft z-50">
        <div className="h-[52px] w-full skeleton rounded-xl" />
      </div>
    </main>
  );
}
