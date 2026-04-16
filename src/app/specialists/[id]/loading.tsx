import { Footer, Header } from "@/widgets";

export default function Loading() {
  return (
    <main className="min-h-screen bg-[#F2F3F5] md:bg-white flex flex-col relative pb-20 md:pb-0">
      {/* Десктопный хедер оставляем настоящим, чтобы можно было сразу пользоваться навигацией */}
      <div className="hidden md:block">
        <Header />
      </div>

      <div className="flex-1 w-full max-w-350 mx-auto md:px-10 flex flex-col pt-0 md:pt-6 pb-10">
        {/* Хлебные крошки (только десктоп) */}
        <div className="hidden md:flex mb-6 items-center gap-2">
          <div className="h-4 w-48 skeleton rounded" />
        </div>

        {/* --- ОСНОВНОЙ БЛОК: ФОТО + ИНФО --- */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-10">
          {/* Левая колонка / Фото */}
          <div className="relative w-full md:w-100 shrink-0-0">
            <div className="relative w-full h-85 md:h-125 skeleton md:rounded-3xl" />
          </div>

          {/* Правая колонка / Информация */}
          <div className="flex-1 flex flex-col bg-white rounded-t-3xl md:rounded-none -mt-6 md:mt-0 relative z-10 p-5 md:p-0">
            {/* Имя и специальность */}
            <div className="flex justify-between items-start mb-6">
              <div className="w-full">
                <div className="h-8 md:h-10 w-3/4 md:w-1/2 skeleton rounded-lg mb-3" />
                <div className="h-5 w-1/3 md:w-1/4 skeleton rounded-md" />
              </div>
            </div>

            {/* Статистика */}
            <div className="flex items-center justify-between md:justify-start md:gap-12 bg-white md:bg-transparent border md:border-none border-[#E3E4E5] rounded-2xl p-4 md:p-0 mb-8">
              <div className="h-12 w-16 skeleton rounded-lg" />
              <div className="h-12 w-16 skeleton rounded-lg" />
              <div className="h-12 w-16 skeleton rounded-lg" />
            </div>

            {/* Десктопные кнопки */}
            <div className="hidden md:flex gap-4 mb-10">
              <div className="h-14 flex-1 skeleton rounded-xl" />
              <div className="h-14 flex-1 skeleton rounded-xl" />
            </div>

            {/* Блоки деталей (Образование, Опыт и т.д.) */}
            <div className="flex flex-col gap-8 md:gap-10 border-t border-[#E3E4E5] md:border-none pt-8 md:pt-0">
              <div className="flex flex-col gap-3">
                <div className="h-6 w-32 skeleton rounded-md" />
                <div className="h-16 w-full skeleton rounded-lg" />
              </div>
              <div className="flex flex-col gap-3">
                <div className="h-6 w-32 skeleton rounded-md" />
                <div className="h-24 w-full skeleton rounded-lg" />
              </div>
              <div className="flex flex-col gap-3">
                <div className="h-6 w-32 skeleton rounded-md" />
                <div className="h-32 w-full skeleton rounded-lg" />
              </div>
            </div>
          </div>
        </div>

        {/* --- СЕКЦИЯ ОТЗЫВОВ --- */}
        <div className="mt-10 md:mt-20 px-5 md:px-0">
          <div className="h-8 w-32 skeleton rounded-md mb-6" />

          <div className="flex flex-col md:flex-row gap-6 md:gap-10">
            {/* Левая колонка - Статистика/Форма */}
            <div className="w-full md:w-[320px] shrink-0-0 flex flex-col gap-5">
              <div className="h-24 w-full skeleton rounded-2xl" />
              <div className="hidden md:block h-64 w-full skeleton rounded-2xl" />
            </div>

            {/* Правая колонка - Отзывы */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="h-32 w-full skeleton rounded-2xl" />
              <div className="h-32 w-full skeleton rounded-2xl" />
            </div>
          </div>
        </div>

        {/* --- СЕКЦИЯ ИНТЕРВЬЮ --- */}
        <div className="mt-10 md:mt-20 mb-10 md:mb-20 px-5 md:px-0">
          <div className="h-8 w-32 skeleton rounded-md mb-6" />
          <div className="flex gap-4 overflow-hidden">
            {/* Скелетоны карточек видео */}
            <div className="h-48 w-70 skeleton rounded-2xl shrink-0-0" />
            <div className="hidden md:block h-48 w-70 skeleton rounded-2xl shrink-0-0" />
            <div className="hidden md:block h-48 w-70 skeleton rounded-2xl shrink-0-0" />
            <div className="hidden lg:block h-48 w-70 skeleton rounded-2xl shrink-0-0" />
          </div>
        </div>
      </div>

      <div className="hidden md:block">
        <Footer />
      </div>

      {/* Мобильная липкая кнопка внизу */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-[#E3E4E5] z-50">
        <div className="h-13 w-full skeleton rounded-xl" />
      </div>
    </main>
  );
}
