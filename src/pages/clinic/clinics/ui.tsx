"use client";

import { FC } from "react";

import Link from "next/link";

import { useQuery } from "@tanstack/react-query";

import { Footer } from "@/widgets/footer";
import { Header } from "@/widgets/header";

import { ActiveFiltersChips } from "@/features/active-filters-chips";
import { useFavoriteToggle } from "@/features/favorite-toggle";
import { FilterBar } from "@/features/filter-bar";
import { FiltersTrigger, MobileFiltersModal } from "@/features/mobile-filters";
import { UrlSearchInput } from "@/features/search-by-query";

import { ClinicCard, ClinicSkeleton } from "@/entities/clinic";

import { ClinicFilters, api, clinicKeys } from "@/shared/api";
import { ROUTES } from "@/shared/config";
import { useCityStore } from "@/shared/store";

// Специализация остаётся клиентским фильтром: ClinicFilters.specialization —
// такое же одно-строковое поле, как у /api/doctors/, где этот же параметр на
// практике не находит совпадений (проверено). Пока бэк не подтвердит, что
// для клиник он работает иначе, безопаснее не полагаться на него.
// page_size увеличен для той же клиентской фильтрации (макет без пагинации).
const FULL_LIST_PAGE_SIZE = 200;

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

  // 2. Город и оценка уходят в реальные query-параметры API.
  const filters: ClinicFilters = {
    city: selectedCity || undefined,
    min_rating:
      currentRating && currentRating !== "all"
        ? parseFloat(currentRating)
        : undefined,
    page_size: FULL_LIST_PAGE_SIZE,
  };

  const { data: clinics = [], isLoading } = useQuery({
    queryKey: clinicKeys.list(filters),
    queryFn: () => api.getClinics(filters),
  });

  // 3. Специализация и текстовый поиск — клиентские.
  const filteredClinics = clinics.filter((clinic) => {
    if (activeQuery) {
      const q = activeQuery.toLowerCase();
      if (!clinic.name.toLowerCase().includes(q)) return false;
    }

    if (currentSpec) {
      const selectedSpecs = currentSpec.split(",");
      const hasMatch = clinic.specialties?.some((spec) =>
        selectedSpecs.includes(spec),
      );
      if (!hasMatch) return false;
    }

    return true;
  });

  const { isSaved, toggle } = useFavoriteToggle("clinic");

  const clinicFilters = {
    specialty: true,
    experience: false,
    rating: true,
    price: false,
  };

  return (
    <main className="min-h-screen bg-background md:bg-white flex flex-col">
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
            <h2 className="text-foreground text-lg font-medium mb-4">
              Результаты по запросу: {activeQuery}
            </h2>
          )}

          <div className="flex flex-col gap-2">
            {isLoading ? (
              <ClinicSkeleton count={4} variant="horizontal" />
            ) : filteredClinics.length === 0 ? (
              <p className="text-center text-muted py-10">
                По вашим параметрам клиники не найдены
              </p>
            ) : (
              filteredClinics.map((clinic) => (
                <ClinicCard
                  key={`mob-${clinic.id}`}
                  {...clinic}
                  variant="horizontal"
                  initialSaved={isSaved(Number(clinic.id))}
                  onSave={() => toggle(Number(clinic.id))}
                />
              ))
            )}
          </div>
        </div>

        {/* --- ДЕСКТОПНАЯ ВЕРСИЯ --- */}
        <div className="hidden md:block px-10 py-6">
          <div className="text-sm text-secondary mb-6 flex items-center gap-2">
            <Link
              href={ROUTES.HOME}
              className="hover:text-primary transition-colors"
            >
              Главная
            </Link>
            <span>•</span>
            <span className={activeQuery ? "" : "text-primary"}>
              {activeQuery ? (
                <Link
                  href={ROUTES.CLINICS}
                  className="hover:text-primary transition-colors"
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
                <span className="text-primary">По запросу «{activeQuery}»</span>
              </>
            )}
          </div>

          <FilterBar title="Клиники" prefix="clinic" fields={clinicFilters} />

          <div className="mt-2">
            {isLoading ? (
              <ClinicSkeleton count={8} variant="vertical" />
            ) : filteredClinics.length === 0 ? (
              <p className="col-span-4 text-center text-muted py-20 text-lg">
                По вашим параметрам клиники не найдены
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-5 items-stretch">
                {filteredClinics.map((clinic) => (
                  <ClinicCard
                    key={`desk-${clinic.id}`}
                    {...clinic}
                    initialSaved={isSaved(Number(clinic.id))}
                    onSave={() => toggle(Number(clinic.id))}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="hidden md:block mt-auto">
        <Footer />
      </div>
    </main>
  );
};
