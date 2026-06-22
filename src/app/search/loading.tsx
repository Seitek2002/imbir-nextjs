import { Header } from "@/widgets";

import { SearchIcon } from "@/shared/assets";

export default function Loading() {
  return (
    <main className="min-h-screen bg-background md:bg-white flex flex-col">
      {/* Шапка со статичной обманкой вместо настоящего инпута */}
      <Header title="Поиск" backTo="/">
        <div className="flex gap-3 items-center mt-3 md:mt-0 md:block">
          <div className="flex-1">
            <div className="flex items-center w-full gap-2 border border-border-soft px-3 py-2.25 rounded-full bg-white opacity-70">
              <SearchIcon className="size-5 text-foreground" />
              <div className="w-1/2 h-4 skeleton rounded" />
            </div>
          </div>
        </div>
      </Header>

      {/* Анимированный скелетон вместо контента */}
      <div className="flex-1 w-full max-w-360 mx-auto pb-10 px-4 md:px-10 pt-6 md:pt-16">
        {/* Скелетон для десктопного инпута (скрыт на мобилках) */}
        <div className="hidden md:block mb-8 drop-shadow-sm rounded-full">
          <div className="w-full h-13 bg-gray-100 rounded-full" />
        </div>

        {/* Скелетон для блока с категориями/историей */}
        <div className="bg-white md:bg-transparent rounded-3xl md:rounded-none overflow-hidden flex flex-col gap-6">
          <div className="w-full h-32 bg-gray-100 rounded-2xl" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="w-full h-24 bg-gray-100 rounded-2xl" />
            <div className="w-full h-24 bg-gray-100 rounded-2xl" />
            <div className="w-full h-24 bg-gray-100 rounded-2xl" />
            <div className="w-full h-24 bg-gray-100 rounded-2xl" />
          </div>
        </div>
      </div>
    </main>
  );
}
