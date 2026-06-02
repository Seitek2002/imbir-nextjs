"use client";

import { FC } from "react";

import Link from "next/link";

// <-- ИМПОРТ REACT QUERY

import {
  ActiveFiltersChips,
  FiltersTrigger,
  MobileFiltersModal,
} from "@/features";
import { Footer, Header } from "@/widgets";
import { useQuery } from "@tanstack/react-query";

import { FilterBar } from "@/features/filter-bar/ui";
import { UrlSearchInput } from "@/features/search-by-query/ui";

import { DoctorCard, DoctorSkeleton } from "@/entities/doctor";
import { adaptDoctor } from "@/entities/doctor/adapters";

import { getDoctors } from "@/shared/api/doctors/requests";
import { doctorKeys } from "@/shared/api/queryKeys";
import { ROUTES } from "@/shared/config/routes";
import { useCityStore } from "@/shared/store/cityStore";
import { Button } from "@/shared/ui";

// <-- ИМПОРТ НАШЕГО API

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export const SpecialistsPage: FC<Props> = ({ searchParams }) => {
  // 1. Читаем параметры из пропсов
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
  const isOnlineOnly = searchParams?.doc_online === "true";

  const selectedCity = useCityStore((s) => s.city);

  // Собираем фильтры для API
  const expParts = currentExp?.split("-").map(Number);
  const priceParts = currentPrice?.split("-").map(Number);

  const apiFilters = {
    city: selectedCity,
    ...(activeQuery ? { search: activeQuery } : {}),
    ...(currentSpec ? { specialization: currentSpec } : {}),
    ...(currentRating && currentRating !== "all"
      ? { min_rating: parseFloat(currentRating) }
      : {}),
    ...(priceParts
      ? { min_price: priceParts[0], max_price: priceParts[1] }
      : {}),
    ...(isOnlineOnly ? { is_online: true } : {}),
  };

  // 2. ПОЛУЧАЕМ ДАННЫЕ С СЕРВЕРА (фильтрация на бэке)
  const { data: result, isLoading } = useQuery({
    queryKey: doctorKeys.list(apiFilters),
    queryFn: () => getDoctors(apiFilters),
  });

  // Адаптируем snake_case API → camelCase для DoctorCard
  const filteredDoctors = (result?.data ?? [])
    .map(adaptDoctor)
    .filter((doc) => {
      // Клиент-сайд фильтр по стажу (нет в API)
      if (currentExp && expParts) {
        if (doc.experience < expParts[0] || doc.experience > expParts[1])
          return false;
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
          online: true,
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
            {isLoading ? (
              <DoctorSkeleton count={4} variant="horizontal" />
            ) : filteredDoctors.length === 0 ? (
              <p className="text-center text-[#838A8D] py-10">
                По вашим параметрам врачи не найдены
              </p>
            ) : (
              filteredDoctors.map((doc) => (
                <DoctorCard
                  key={`mob-${doc.id}`}
                  {...doc}
                  variant="horizontal"
                />
              ))
            )}
          </div>

          {!isLoading && filteredDoctors.length > 0 && (
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

          <FilterBar
            prefix="doc"
            title="Специалисты"
            fields={{
              specialty: true,
              experience: true,
              rating: true,
              price: true,
              online: true,
            }}
          />

          <div className="mt-2">
            {isLoading ? (
              <DoctorSkeleton count={8} variant="vertical" />
            ) : filteredDoctors.length === 0 ? (
              <p className="text-center text-[#838A8D] py-20 text-lg">
                По вашим параметрам врачи не найдены
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-5 items-stretch">
                {filteredDoctors.map((doc) => (
                  <DoctorCard key={`desk-${doc.id}`} {...doc} />
                ))}
              </div>
            )}
          </div>

          {!isLoading && filteredDoctors.length > 0 && (
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
