"use client";

import { FC, useEffect, useState } from "react";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { CategoriesGrid, Footer, Header, RecentSearches } from "@/widgets";

import { FilterBar } from "@/features/filter-bar/ui";

import { DoctorCard } from "@/entities/doctor";

import { DoctorImage1, DoctorImage2, DoctorImage3 } from "@/shared/assets";
import { Button, SearchInput } from "@/shared/ui";

const QUERY_KEY = "q";

const MOCK_DOCTORS = [
  {
    id: 1,
    name: "Айбеков Нурлан Эльдарович",
    specialty: "Врач-терапевт",
    clinic: "Nova Clinic",
    rating: 4.85,
    reviews: 255,
    experience: 12,
    image: DoctorImage1,
  },
  {
    id: 2,
    name: "Садыкова Алина Тимуровна",
    specialty: "Врач-терапевт",
    clinic: "Nova Clinic",
    rating: 4.85,
    reviews: 255,
    experience: 12,
    image: DoctorImage2,
  },
  {
    id: 3,
    name: "Жумабаев Данияр Русланович",
    specialty: "Врач-терапевт",
    clinic: "Nova Clinic",
    rating: 4.85,
    reviews: 255,
    experience: 12,
    image: DoctorImage3,
  },
  {
    id: 4,
    name: "Калиева Айгерим Бакытовна",
    specialty: "Врач-терапевт",
    clinic: "Nova Clinic",
    rating: 4.85,
    reviews: 255,
    experience: 12,
    image: DoctorImage1,
  },
  {
    id: 5,
    name: "Калиева Айгерим Бакытовна",
    specialty: "Врач-терапевт",
    clinic: "Nova Clinic",
    rating: 4.85,
    reviews: 255,
    experience: 12,
    image: DoctorImage1,
  },
  {
    id: 6,
    name: "Садыкова Алина Тимуровна",
    specialty: "Врач-терапевт",
    clinic: "Nova Clinic",
    rating: 4.85,
    reviews: 255,
    experience: 12,
    image: DoctorImage2,
  },
  {
    id: 7,
    name: "Айбеков Нурлан Эльдарович",
    specialty: "Врач-терапевт",
    clinic: "Nova Clinic",
    rating: 4.85,
    reviews: 255,
    experience: 12,
    image: DoctorImage3,
  },
  {
    id: 8,
    name: "Жумабаев Данияр Русланович",
    specialty: "Врач-терапевт",
    clinic: "Nova Clinic",
    rating: 4.85,
    reviews: 255,
    experience: 12,
    image: DoctorImage1,
  },
];

export const SearchPage: FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlQuery = searchParams.get(QUERY_KEY) || "";
  const [query, setQuery] = useState(urlQuery);
  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery);

  if (urlQuery !== prevUrlQuery) {
    setPrevUrlQuery(urlQuery);
    setQuery(urlQuery);
  }

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query === urlQuery) return; // Если всё совпадает, ничего не делаем

      const params = new URLSearchParams(searchParams.toString());
      if (query) {
        params.set(QUERY_KEY, query);
      } else {
        params.delete(QUERY_KEY);
      }
      router.replace(`${pathname}?${params.toString()}`);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, pathname, router, searchParams, urlQuery]);

  const activeQuery = searchParams.get(QUERY_KEY) || "";

  const handleEnter = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (query) params.set(QUERY_KEY, query);
    else params.delete(QUERY_KEY);
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <main className="min-h-screen bg-[#F2F3F5] md:bg-white flex flex-col">
      <Header title="Поиск" backTo="/">
        <SearchInput value={query} onChange={setQuery} onEnter={handleEnter} />
      </Header>

      <div className="flex-1 w-full max-w-360 mx-auto pb-10">
        {activeQuery ? (
          <>
            {/* --- МОБИЛЬНАЯ ВЕРСИЯ РЕЗУЛЬТАТОВ --- */}
            <div className="md:hidden p-4">
              <h2 className="text-[#191A1B] text-lg font-medium mb-4">
                Результаты по запросу: {activeQuery}
              </h2>
              <div className="flex flex-col gap-2">
                {MOCK_DOCTORS.slice(0, 4).map((doc) => (
                  <DoctorCard
                    key={`mob-${doc.id}`}
                    {...doc}
                    variant="horizontal"
                  />
                ))}
              </div>
              <Button
                variant="outline"
                className="w-full mt-6 bg-white justify-center"
              >
                Показать еще
              </Button>
            </div>

            {/* --- ДЕСКТОПНАЯ ВЕРСИЯ РЕЗУЛЬТАТОВ (КАК НА СКРИНЕ) --- */}
            <div className="hidden md:block px-10 py-6">
              <div className="text-sm text-[#686F72] mb-6 flex items-center gap-2">
                <Link
                  href="/"
                  className="hover:text-[#F5653E] transition-colors"
                >
                  Главная
                </Link>
                <span>•</span>
                <span className="text-[#F5653E]">
                  По запросу «{activeQuery}»
                </span>
              </div>

              <FilterBar>
                <div className="flex items-end gap-3 mb-6">
                  <h1 className="text-[40px] font-semibold text-[#191A1B] leading-none">
                    По запросу «{activeQuery}»
                  </h1>
                  <span className="text-[#838A8D] text-lg pb-1">
                    {MOCK_DOCTORS.length} совпадений
                  </span>
                </div>
              </FilterBar>

              <div className="grid grid-cols-4 gap-5 mt-2">
                {MOCK_DOCTORS.map((doc) => (
                  <DoctorCard key={`desk-${doc.id}`} {...doc} />
                ))}
              </div>

              <div className="flex justify-center mt-10">
                <Button variant="outline" className="bg-white">
                  Показать еще
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* --- СОСТОЯНИЕ ДО ПОИСКА (ПУСТОЙ ИНПУТ) --- */
          <div className="px-4 md:px-10 pt-6 md:pt-16 max-w-200 mx-auto w-full">
            <div className="hidden md:block mb-8 drop-shadow-sm rounded-full">
              <SearchInput
                value={query}
                onChange={setQuery}
                onEnter={handleEnter}
                placeholder="Поиск клиники, специалиста, услуги"
              />
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
