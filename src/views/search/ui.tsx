import { FC, Suspense } from "react";

import dynamic from "next/dynamic";
import Link from "next/link";

import { ActiveFiltersChips, FiltersTrigger } from "@/features";
import { Header } from "@/widgets";

import { UrlSearchInput } from "@/features/search-by-query/ui";

import { ROUTES } from "@/shared/config/routes";
import { MOCK_SPECIALISTS } from "@/shared/constants/mocks";
import { Button } from "@/shared/ui";

const MobileFiltersModal = dynamic(() =>
  import("@/features").then((mod) => mod.MobileFiltersModal),
);
const Footer = dynamic(() => import("@/widgets").then((mod) => mod.Footer));
const CategoriesGrid = dynamic(() =>
  import("@/widgets").then((mod) => mod.CategoriesGrid),
);
const RecentSearches = dynamic(() =>
  import("@/widgets").then((mod) => mod.RecentSearches),
);
const FilterBar = dynamic(() =>
  import("@/features/filter-bar/ui").then((mod) => mod.FilterBar),
);
const DoctorCard = dynamic(() =>
  import("@/entities/doctor").then((mod) => mod.DoctorCard),
);

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export const SearchPage: FC<Props> = ({ searchParams }) => {
  // 1. Читаем параметры поиска и модалки
  const activeQuery = typeof searchParams?.q === "string" ? searchParams.q : "";
  const isFiltersModalOpen = searchParams?.modal === "filters";

  // 2. Читаем параметры фильтров
  const currentSpec =
    typeof searchParams?.doc_spec === "string" ? searchParams.doc_spec : null;
  const currentRating =
    typeof searchParams?.doc_rating === "string"
      ? searchParams.doc_rating
      : null;
  const currentExp =
    typeof searchParams?.doc_exp === "string" ? searchParams.doc_exp : null;
  const currentPrice =
    typeof searchParams?.doc_price === "string" ? searchParams.doc_price : null;

  // <-- НОВОЕ: Читаем флаг "онлайн" из URL
  const isOnlineOnly = searchParams?.doc_online === "true";

  // 3. ФИЛЬТРУЕМ ДАННЫЕ НА ЛЕТУ
  const filteredResults = MOCK_SPECIALISTS.filter((doc) => {
    // A. Поиск по строке (Имя или Специальность)
    if (activeQuery) {
      const q = activeQuery.toLowerCase();
      const matchesName = doc.name.toLowerCase().includes(q);
      const matchesSpec = doc.specialty.toLowerCase().includes(q);
      if (!matchesName && !matchesSpec) return false;
    }

    // B. Фильтры из FilterBar / MobileFiltersModal

    // <-- НОВОЕ: Если юзер включил чекбокс "Только онлайн",
    // отсеиваем тех врачей, у которых isOnlineAvailable === false
    if (isOnlineOnly && !doc.isOnlineAvailable) return false;

    if (currentSpec) {
      const selectedSpecs = currentSpec.split(",");
      if (!selectedSpecs.includes(doc.specialty)) return false;
    }

    if (currentRating && currentRating !== "all") {
      const minRating = parseFloat(currentRating);
      if (doc.rating < minRating) return false;
    }

    if (currentExp) {
      const [minExp, maxExp] = currentExp.split("-").map(Number);
      if (doc.experience < minExp || doc.experience > maxExp) return false;
    }

    if (currentPrice) {
      const [minPrice, maxPrice] = currentPrice.split("-").map(Number);
      // Теперь doc.price не существует, нам нужно проверить массив workplaces
      // Ищем минимальную цену среди всех клиник врача
      const docMinPrice =
        doc.workplaces.length > 0
          ? Math.min(...doc.workplaces.map((w) => w.price))
          : 0;

      if (docMinPrice < minPrice || docMinPrice > maxPrice) return false;
    }

    return true;
  });

  return (
    <main className="min-h-screen bg-[#F2F3F5] md:bg-white flex flex-col">
      <Header title="Поиск" backTo={ROUTES.HOME}>
        <div className="flex gap-3 items-center mt-3 md:mt-0 md:block">
          <div className="flex-1">
            <Suspense
              fallback={
                <div className="h-10.5 w-full bg-gray-100 rounded-lg" />
              }
            >
              <UrlSearchInput />
            </Suspense>
          </div>
          <div className="md:hidden">
            <FiltersTrigger />
          </div>
        </div>
        <ActiveFiltersChips prefix="doc" />
      </Header>

      <MobileFiltersModal
        isOpen={isFiltersModalOpen}
        prefix="doc"
        fields={{
          specialty: true,
          experience: true,
          rating: true,
          price: true,
          online: true, // <-- НОВОЕ: Включаем онлайн-фильтр в модалке
        }}
      />

      <div className="flex-1 w-full max-w-360 mx-auto pb-10">
        {activeQuery ? (
          <>
            {/* МОБИЛЬНАЯ ВЕРСИЯ РЕЗУЛЬТАТОВ ПОИСКА */}
            <div className="md:hidden p-4">
              <h2 className="text-[#191A1B] text-lg font-medium mb-4">
                Результаты по запросу: {activeQuery}
              </h2>
              <div className="flex flex-col gap-2">
                {filteredResults.length === 0 && (
                  <p className="text-center text-[#838A8D] py-10">
                    Ничего не найдено
                  </p>
                )}
                {filteredResults.slice(0, 4).map((doc) => (
                  <DoctorCard
                    key={`mob-${doc.id}`}
                    {...doc}
                    variant="horizontal"
                  />
                ))}
              </div>
              {filteredResults.length > 4 && (
                <Button
                  variant="outline"
                  className="w-full mt-6 bg-white justify-center"
                >
                  Показать еще
                </Button>
              )}
            </div>

            {/* ДЕСКТОПНАЯ ВЕРСИЯ РЕЗУЛЬТАТОВ ПОИСКА */}
            <div className="hidden md:block px-10 py-6">
              <div className="text-sm text-[#686F72] mb-6 flex items-center gap-2">
                <Link
                  href={ROUTES.HOME}
                  className="hover:text-[#F5653E] transition-colors"
                >
                  Главная
                </Link>
                <span>•</span>
                <span className="text-[#F5653E]">
                  По запросу «{activeQuery}»
                </span>
              </div>

              <FilterBar
                prefix="doc"
                fields={{
                  specialty: true,
                  experience: true,
                  rating: true,
                  price: true,
                  online: true, // <-- НОВОЕ: Включаем онлайн-фильтр на ПК
                }}
              >
                <div className="flex items-end gap-3 mb-6">
                  <h1 className="text-[40px] font-semibold text-[#191A1B] leading-none">
                    По запросу «{activeQuery}»
                  </h1>
                  <span className="text-[#838A8D] text-lg pb-1">
                    {filteredResults.length} совпадений
                  </span>
                </div>
              </FilterBar>

              <div className="grid grid-cols-4 gap-5 mt-2">
                {filteredResults.length === 0 && (
                  <p className="col-span-4 text-center text-[#838A8D] py-20 text-lg">
                    По вашим параметрам врачи не найдены
                  </p>
                )}
                {filteredResults.map((doc) => (
                  <DoctorCard key={`desk-${doc.id}`} {...doc} />
                ))}
              </div>

              {filteredResults.length > 0 && (
                <div className="flex justify-center mt-10">
                  <Button variant="outline" className="bg-white">
                    Показать еще
                  </Button>
                </div>
              )}
            </div>
          </>
        ) : (
          /* ЕСЛИ ЗАПРОС ПУСТОЙ - ПОКАЗЫВАЕМ ИСТОРИЮ И КАТЕГОРИИ */
          <div className="px-4 md:px-10 pt-6 md:pt-16 max-w-200 mx-auto w-full">
            <div className="hidden md:block mb-8 drop-shadow-sm rounded-full">
              <Suspense
                fallback={
                  <div className="h-13 w-full bg-gray-100 rounded-full" />
                }
              >
                <UrlSearchInput />
              </Suspense>
            </div>

            <div className="bg-white md:bg-transparent rounded-3xl md:rounded-none overflow-hidden md:flex md:flex-col md:gap-6">
              <RecentSearches />
              <CategoriesGrid />
            </div>
          </div>
        )}
      </div>

      <div className="hidden md:block mt-auto">
        <Footer />
      </div>
    </main>
  );
};
