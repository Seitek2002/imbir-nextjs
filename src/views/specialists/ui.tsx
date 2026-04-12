"use client";

import { FC } from "react";

import Link from "next/link";

import {
  ActiveFiltersChips,
  FiltersTrigger,
  MobileFiltersModal,
} from "@/features";
import { Footer, Header } from "@/widgets";

import { FilterBar } from "@/features/filter-bar/ui";
import { UrlSearchInput } from "@/features/search-by-query/ui";

import { DoctorCard } from "@/entities/doctor";

import { ROUTES } from "@/shared/config/routes";
import { MOCK_SPECIALISTS } from "@/shared/constants/mocks";
import { Button } from "@/shared/ui";

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export const SpecialistsPage: FC<Props> = ({ searchParams }) => {
  // 1. Читаем параметры из пропсов (Next.js Page)
  const activeQuery = typeof searchParams?.q === "string" ? searchParams.q : "";
  const isFiltersModalOpen = searchParams?.modal === "filters";

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

  // 2. Фильтруем массив перед рендером
  const filteredDoctors = MOCK_SPECIALISTS.filter((doc) => {
    // Поиск по имени или специальности
    if (activeQuery) {
      const q = activeQuery.toLowerCase();
      if (
        !doc.name.toLowerCase().includes(q) &&
        !doc.specialty.toLowerCase().includes(q)
      ) {
        return false;
      }
    }

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
      if (doc.price < minPrice || doc.price > maxPrice) return false;
    }

    return true;
  });

  return (
    <main className="min-h-screen bg-[#F2F3F5] md:bg-white flex flex-col">
      <Header title="Специалисты" backTo={ROUTES.HOME}>
        <div className="flex gap-3 items-center mt-3 md:mt-0 md:block">
          <div className="flex-1">
            <UrlSearchInput placeholder="Поиск специалиста" />
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
        }}
      />

      <div className="flex-1 w-full max-w-360 mx-auto pb-10">
        {/* --- МОБИЛЬНАЯ ВЕРСИЯ --- */}
        <div className="md:hidden p-4">
          {activeQuery && (
            <h2 className="text-[#191A1B] text-lg font-medium mb-4">
              Результаты по запросу: {activeQuery}
            </h2>
          )}

          <div className="flex flex-col gap-2">
            {filteredDoctors.length === 0 && (
              <p className="text-center text-[#838A8D] py-10">
                По вашим параметрам врачи не найдены
              </p>
            )}
            {filteredDoctors.map((doc) => (
              <DoctorCard key={`mob-${doc.id}`} {...doc} variant="horizontal" />
            ))}
          </div>

          {filteredDoctors.length > 0 && (
            <Button
              variant="outline"
              className="w-full mt-6 bg-white justify-center"
            >
              Показать еще
            </Button>
          )}
        </div>

        {/* --- ДЕСКТОПНАЯ ВЕРСИЯ --- */}
        <div className="hidden md:block px-10 py-6">
          <div className="text-sm text-[#686F72] mb-6 flex items-center gap-2">
            <Link
              href={ROUTES.HOME}
              className="hover:text-[#F5653E] transition-colors"
            >
              Главная
            </Link>
            <span>•</span>
            <span className={activeQuery ? "" : "text-[#F5653E]"}>
              {activeQuery ? (
                <Link
                  href={ROUTES.SPECIALISTS}
                  className="hover:text-[#F5653E] transition-colors"
                >
                  Специалисты
                </Link>
              ) : (
                "Специалисты"
              )}
            </span>
            {activeQuery && (
              <>
                <span>•</span>
                <span className="text-[#F5653E]">
                  По запросу «{activeQuery}»
                </span>
              </>
            )}
          </div>

          {/* ДОБАВИЛИ ПРЕФИКС! */}
          <FilterBar prefix="doc" title="Специалисты" />

          <div className="grid grid-cols-4 gap-5 mt-2">
            {filteredDoctors.length === 0 && (
              <p className="col-span-4 text-center text-[#838A8D] py-20 text-lg">
                По вашим параметрам врачи не найдены
              </p>
            )}
            {filteredDoctors.map((doc) => (
              <DoctorCard key={`desk-${doc.id}`} {...doc} />
            ))}
          </div>

          {filteredDoctors.length > 0 && (
            <div className="flex justify-center mt-10">
              <Button variant="outline" className="bg-white">
                Показать еще
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="hidden md:block mt-auto">
        <Footer />
      </div>
    </main>
  );
};
