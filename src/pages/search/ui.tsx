"use client";

import { FC, Suspense } from "react";

import dynamic from "next/dynamic";
import Link from "next/link";

import { useQuery } from "@tanstack/react-query";

import { Header } from "@/widgets/header";

import { ActiveFiltersChips } from "@/features/active-filters-chips";
import { FiltersTrigger } from "@/features/mobile-filters";
import { UrlSearchInput } from "@/features/search-by-query";

import { api } from "@/shared/api";
import { ROUTES } from "@/shared/config";
import { Button } from "@/shared/ui";

const MobileFiltersModal = dynamic(() =>
  import("@/features/mobile-filters").then((mod) => mod.MobileFiltersModal),
);
const Footer = dynamic(() =>
  import("@/widgets/footer").then((mod) => mod.Footer),
);
const CategoriesGrid = dynamic(() =>
  import("@/features/global-search").then((mod) => mod.CategoriesGrid),
);
const RecentSearches = dynamic(() =>
  import("@/features/global-search").then((mod) => mod.RecentSearches),
);
const FilterBar = dynamic(() =>
  import("@/features/filter-bar").then((mod) => mod.FilterBar),
);
const DoctorCard = dynamic(() =>
  import("@/entities/doctor").then((mod) => mod.DoctorCard),
);
// <-- ДОБАВЛЯЕМ ИМПОРТ КАРТОЧКИ КЛИНИКИ
const ClinicCard = dynamic(() =>
  import("@/entities/clinic").then((mod) => mod.ClinicCard),
);

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export const SearchPage: FC<Props> = ({ searchParams }) => {
  // 1. Читаем параметры
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

  // 2. ПОЛУЧАЕМ ВСЕ ДАННЫЕ С СЕРВЕРА
  const { data: doctors = [], isLoading: isDocsLoading } = useQuery({
    queryKey: ["doctors"],
    queryFn: () => api.getDoctors(),
  });

  const { data: clinics = [], isLoading: isClinicsLoading } = useQuery({
    queryKey: ["clinics"],
    queryFn: api.getClinics,
  });

  const { data: services = [], isLoading: isServicesLoading } = useQuery({
    queryKey: ["services"],
    queryFn: api.getServices,
  });

  const isLoading = isDocsLoading || isClinicsLoading || isServicesLoading;

  // 3. ФИЛЬТРУЕМ ДАННЫЕ НА ЛЕТУ ПО ЗАПРОСУ И ФИЛЬТРАМ

  // --- ФИЛЬТР ВРАЧЕЙ ---
  const filteredDoctors = doctors.filter((doc) => {
    if (activeQuery) {
      const q = activeQuery.toLowerCase();
      const matchesName = doc.name.toLowerCase().includes(q);
      const matchesSpec = doc.specialty.toLowerCase().includes(q);
      if (!matchesName && !matchesSpec) return false;
    }

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
      const docMinPrice =
        doc.workplaces.length > 0
          ? Math.min(...doc.workplaces.map((w) => w.price))
          : 0;
      if (docMinPrice < minPrice || docMinPrice > maxPrice) return false;
    }

    return true;
  });

  // --- ФИЛЬТР КЛИНИК ---
  const filteredClinics = clinics.filter((clinic) => {
    if (!activeQuery) return false; // Показываем клиники только если есть текстовый запрос
    const q = activeQuery.toLowerCase();
    const matchesName = clinic.name.toLowerCase().includes(q);
    const matchesSpec = clinic.specialties.some((s) =>
      s.toLowerCase().includes(q),
    );
    return matchesName || matchesSpec;
  });

  // --- ФИЛЬТР УСЛУГ ---
  const filteredServices = services.filter((service) => {
    if (!activeQuery) return false;
    const q = activeQuery.toLowerCase();
    const matchesName = service.name.toLowerCase().includes(q);
    const matchesCat = service.category.toLowerCase().includes(q);
    return matchesName || matchesCat;
  });

  const hasAnyResults =
    filteredDoctors.length > 0 ||
    filteredClinics.length > 0 ||
    filteredServices.length > 0;

  return (
    <main className="min-h-screen bg-background md:bg-white flex flex-col">
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
          online: true,
        }}
      />

      <div className="flex-1 w-full max-w-360 mx-auto pb-10">
        {activeQuery ? (
          isLoading ? (
            <div className="flex justify-center items-center py-20 text-muted">
              Выполняем поиск...
            </div>
          ) : (
            <>
              {/* === МОБИЛЬНАЯ ВЕРСИЯ РЕЗУЛЬТАТОВ === */}
              <div className="md:hidden p-4 flex flex-col gap-8">
                <h2 className="text-foreground text-lg font-medium">
                  Результаты по запросу: {activeQuery}
                </h2>

                {!hasAnyResults && (
                  <p className="text-center text-muted py-10">
                    Ничего не найдено
                  </p>
                )}

                {/* Блок Врачей */}
                {filteredDoctors.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <h3 className="font-semibold text-foreground text-base border-b border-border-soft pb-2">
                      Врачи
                    </h3>
                    <div className="flex flex-col gap-2">
                      {filteredDoctors.slice(0, 4).map((doc) => (
                        <DoctorCard
                          key={`mob-doc-${doc.id}`}
                          {...doc}
                          variant="horizontal"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Блок Клиник */}
                {filteredClinics.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <h3 className="font-semibold text-foreground text-base border-b border-border-soft pb-2">
                      Клиники
                    </h3>
                    <div className="flex flex-col gap-2">
                      {filteredClinics.slice(0, 3).map((clinic) => (
                        <ClinicCard
                          key={`mob-clinic-${clinic.id}`}
                          {...clinic}
                          variant="horizontal"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Блок Услуг */}
                {filteredServices.length > 0 && (
                  <div className="flex flex-col gap-3">
                    <h3 className="font-semibold text-foreground text-base border-b border-border-soft pb-2">
                      Услуги
                    </h3>
                    <div className="flex flex-col gap-2">
                      {filteredServices.map((service) => (
                        <div
                          key={service.id}
                          className="bg-white p-3 rounded-xl border border-border-soft flex justify-between items-center"
                        >
                          <div>
                            <p className="font-semibold text-sm text-foreground">
                              {service.name}
                            </p>
                            <p className="text-xs text-muted">
                              {service.category}
                            </p>
                          </div>
                          <div className="font-bold text-foreground text-sm">
                            {service.price} с
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* === ДЕСКТОПНАЯ ВЕРСИЯ РЕЗУЛЬТАТОВ === */}
              <div className="hidden md:block px-10 py-6">
                <div className="text-sm text-secondary mb-6 flex items-center gap-2">
                  <Link
                    href={ROUTES.HOME}
                    className="hover:text-primary transition-colors"
                  >
                    Главная
                  </Link>
                  <span>•</span>
                  <span className="text-primary">
                    По запросу «{activeQuery}»
                  </span>
                </div>

                {!hasAnyResults ? (
                  <div className="text-center py-20">
                    <h1 className="text-[40px] font-semibold text-foreground leading-none mb-4">
                      По запросу «{activeQuery}»
                    </h1>
                    <p className="text-muted text-lg">
                      По вашим параметрам ничего не найдено
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-14">
                    {/* Секция Врачей с фильтрами */}
                    {filteredDoctors.length > 0 && (
                      <div>
                        <FilterBar
                          prefix="doc"
                          fields={{
                            specialty: true,
                            experience: true,
                            rating: true,
                            price: true,
                            online: true,
                          }}
                        >
                          <div className="flex items-end gap-3 mb-6">
                            <h2 className="text-[32px] font-semibold text-foreground leading-none">
                              Врачи
                            </h2>
                            <span className="text-muted text-lg pb-1">
                              {filteredDoctors.length} совпадений
                            </span>
                          </div>
                        </FilterBar>
                        <div className="grid grid-cols-4 gap-5 mt-2">
                          {filteredDoctors.map((doc) => (
                            <DoctorCard
                              key={`desk-doc-${doc.id}`}
                              {...doc}
                              variant="vertical"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Секция Клиник */}
                    {filteredClinics.length > 0 && (
                      <div>
                        <div className="flex items-end gap-3 mb-6">
                          <h2 className="text-[32px] font-semibold text-foreground leading-none">
                            Клиники
                          </h2>
                          <span className="text-muted text-lg pb-1">
                            {filteredClinics.length} совпадений
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-5 items-stretch">
                          {filteredClinics.map((clinic) => (
                            <ClinicCard
                              key={`desk-clinic-${clinic.id}`}
                              {...clinic}
                              variant="vertical"
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Секция Услуг */}
                    {filteredServices.length > 0 && (
                      <div>
                        <div className="flex items-end gap-3 mb-6">
                          <h2 className="text-[32px] font-semibold text-foreground leading-none">
                            Услуги
                          </h2>
                          <span className="text-muted text-lg pb-1">
                            {filteredServices.length} совпадений
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          {filteredServices.map((service) => (
                            <div
                              key={`desk-service-${service.id}`}
                              className="bg-white border border-border-soft rounded-2xl p-4 flex flex-col"
                            >
                              <h4 className="font-semibold text-foreground">
                                {service.name}
                              </h4>
                              <p className="text-xs text-muted mb-4">
                                {service.category}
                              </p>
                              <div className="flex items-center justify-between mt-auto">
                                <span className="font-bold text-foreground text-lg">
                                  {service.price} с
                                </span>
                                <Button variant="outline" size="sm">
                                  Подробнее
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )
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
