"use client";

import { FC } from "react";

import Link from "next/link";

import {
  ActiveFiltersChips,
  FiltersTrigger,
  MobileFiltersModal,
} from "@/features";
import { Footer, Header } from "@/widgets";
import { useQuery } from "@tanstack/react-query";

import { FilterBar } from "@/features/filter-bar/ui";
import { UrlSearchInput } from "@/features/search-by-query/ui";

import { ClinicCard, ClinicSkeleton } from "@/entities/clinic";

import { api } from "@/shared/api/requests";
import { ROUTES } from "@/shared/config/routes";
import { useCityStore } from "@/shared/store/cityStore";
import { Button } from "@/shared/ui";

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export const ClinicsPage: FC<Props> = ({ searchParams }) => {
  const activeQuery = typeof searchParams?.q === "string" ? searchParams.q : "";
  const isFiltersModalOpen = searchParams?.modal === "filters";

  // 1. Читаем параметры фильтров клиник из URL
  const currentSpec =
    typeof searchParams?.clinic_spec === "string"
      ? searchParams.clinic_spec
      : null;
  const currentRating =
    typeof searchParams?.clinic_rating === "string"
      ? searchParams.clinic_rating
      : null;

  const selectedCity = useCityStore((s) => s.city);

  // 2. ПОЛУЧАЕМ ДАННЫЕ С СЕРВЕРА
  const { data: clinics = [], isLoading } = useQuery({
    queryKey: ["clinics"],
    queryFn: api.getClinics,
  });

  // 3. Фильтруем массив клиник (уже реальных)
  const filteredClinics = clinics.filter((clinic) => {
    if (clinic.city !== selectedCity) return false;

    // Поиск по названию клиники
    if (activeQuery) {
      const q = activeQuery.toLowerCase();
      if (!clinic.name.toLowerCase().includes(q)) return false;
    }

    // Фильтр по специальности (проверяем массив специальностей клиники)
    if (currentSpec) {
      const selectedSpecs = currentSpec.split(",");
      const hasMatch = clinic.specialties?.some((spec) =>
        selectedSpecs.includes(spec),
      );
      if (!hasMatch) return false;
    }

    // Фильтр по рейтингу
    if (currentRating && currentRating !== "all") {
      const minRating = parseFloat(currentRating);
      if (clinic.rating < minRating) return false;
    }

    return true;
  });

  const clinicFilters = {
    specialty: true,
    experience: false,
    rating: true,
    price: false,
  };

  return (
    <main className="min-h-screen bg-[#F2F3F5] md:bg-white flex flex-col">
      <Header title="Клиники" backTo={ROUTES.HOME}>
        <div className="flex gap-3 items-center mt-3 md:mt-0 md:block">
          <div className="flex-1">
            <UrlSearchInput placeholder="Поиск клиники" />
          </div>
          <div className="md:hidden">
            <FiltersTrigger />
          </div>
        </div>
        <ActiveFiltersChips prefix="clinic" />
      </Header>

      <MobileFiltersModal
        isOpen={isFiltersModalOpen}
        prefix="clinic"
        fields={clinicFilters}
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
              <ClinicSkeleton count={4} variant="horizontal" />
            ) : filteredClinics.length === 0 ? (
              <p className="text-center text-[#838A8D] py-10">
                По вашим параметрам клиники не найдены
              </p>
            ) : (
              filteredClinics.map((clinic) => (
                <ClinicCard
                  key={`mob-${clinic.id}`}
                  {...clinic}
                  variant="horizontal"
                />
              ))
            )}
          </div>

          {!isLoading && filteredClinics.length > 0 && (
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
                  href={ROUTES.CLINICS}
                  className="hover:text-[#F5653E] transition-colors"
                >
                  Клиники
                </Link>
              ) : (
                "Клиники"
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

          <FilterBar title="Клиники" prefix="clinic" fields={clinicFilters} />

          <div className="mt-2">
            {isLoading ? (
              <ClinicSkeleton count={8} variant="vertical" />
            ) : filteredClinics.length === 0 ? (
              <p className="col-span-4 text-center text-[#838A8D] py-20 text-lg">
                По вашим параметрам клиники не найдены
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-5 items-stretch">
                {filteredClinics.map((clinic) => (
                  <ClinicCard key={`desk-${clinic.id}`} {...clinic} />
                ))}
              </div>
            )}
          </div>

          {!isLoading && filteredClinics.length > 0 && (
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
