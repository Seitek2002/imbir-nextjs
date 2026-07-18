"use client";

import { FC, useEffect, useState } from "react";

import Link from "next/link";

import { useInfiniteQuery } from "@tanstack/react-query";

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
import { Button } from "@/shared/ui";

// Постраничная подгрузка: 8 клиник за раз, дальше — по кнопке «Показать ещё».
const PAGE_SIZE = 8;

// Город, текстовый поиск, оценка, цена и стаж уходят на бэк реальными
// query-параметрами (проверено живыми запросами: min_price=999999 → 0,
// search=Мед → только «Клиника Мед-Сити»).
//
// TODO: специализация остаётся КЛИЕНТСКОЙ и фильтрует только уже подгруженные
// страницы — бэк на /api/clinics/?specialization= возвращает 0 для любого
// значения (проверено: у всех клиник в primary_specializations есть
// «Кардиология», но фильтр отдаёт пусто; те же значения у /api/doctors/
// работают). Как починят — перенести specialization в filters ниже и убрать
// клиентский filter.

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
  // City the server prefetched clinics for (from the city cookie, see
  // app/clinics/page.tsx).
  initialCity: string;
};

export const ClinicsPage: FC<Props> = ({ searchParams, initialCity }) => {
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
  const currentExp =
    typeof searchParams?.clinic_exp === "string"
      ? searchParams.clinic_exp
      : null;
  const currentPrice =
    typeof searchParams?.clinic_price === "string"
      ? searchParams.clinic_price
      : null;

  const storeCity = useCityStore((s) => s.city);
  // Стор персистится из localStorage асинхронно, уже после маунта. Пока
  // гидратация не завершилась, используем город, который сервер реально
  // передал в префетч (initialCity, из cookie) — иначе ключ первого
  // клиентского запроса разойдётся с ключом дегидратированных данных, и
  // HydrationBoundary ничего не подхватит (см. app/clinics/page.tsx).
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    if (useCityStore.persist.hasHydrated()) {
      // Гидратация могла завершиться ещё до маунта этого компонента (напр.
      // переход с другой страницы SPA, стор общий) — onFinishHydration ниже
      // в этом случае никогда не выстрелит, других способов узнать об этом
      // нет. queueMicrotask здесь не спасает: эмпирически проверено (см.
      // use-record-form.ts), что он не гарантированно выигрывает гонку с
      // внутренним микротаском самого Zustand.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsHydrated(true);
      return;
    }
    return useCityStore.persist.onFinishHydration(() => setIsHydrated(true));
  }, []);
  const selectedCity = isHydrated ? storeCity : initialCity;

  const [priceMin, priceMax] = currentPrice
    ? currentPrice.split("-").map(Number)
    : [undefined, undefined];
  const [expMin, expMax] = currentExp
    ? currentExp.split("-").map(Number)
    : [undefined, undefined];

  // 2. Город, поиск, оценка, цена и стаж уходят в реальные query-параметры API.
  const filters: Omit<ClinicFilters, "page" | "page_size"> = {
    city: selectedCity || undefined,
    search: activeQuery || undefined,
    min_rating:
      currentRating && currentRating !== "all"
        ? parseFloat(currentRating)
        : undefined,
    min_price: priceMin,
    max_price: priceMax,
    min_experience: expMin,
    max_experience: expMax,
  };

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: clinicKeys.list(filters),
      queryFn: ({ pageParam }) =>
        api.getClinicsPaginated({
          ...filters,
          page: pageParam,
          page_size: PAGE_SIZE,
        }),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage && lastPage.pagination.page < lastPage.pagination.total_pages
          ? lastPage.pagination.page + 1
          : undefined,
    });

  const clinics = data?.pages.flatMap((page) => page.data) ?? [];

  // 3. Клиентской осталась только специализация (см. TODO вверху файла) —
  // поиск теперь фильтрует бэк, поэтому дублировать его тут не нужно.
  const filteredClinics = clinics.filter((clinic) => {
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

  // Цена и стаж включены: бэк научился по ним фильтровать (min_price/max_price,
  // min_experience/max_experience — проверено живыми запросами).
  const clinicFilters = {
    specialty: true,
    experience: true,
    rating: true,
    price: true,
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
              filteredClinics.map((clinic, index) => (
                <ClinicCard
                  key={`mob-${clinic.id}`}
                  {...clinic}
                  variant="horizontal"
                  priority={index < 2}
                  initialSaved={isSaved(Number(clinic.id))}
                  onSave={() => toggle(Number(clinic.id))}
                />
              ))
            )}
          </div>

          {hasNextPage && (
            <div className="flex justify-center mt-4">
              <Button
                variant="outline"
                onClick={() => fetchNextPage()}
                loading={isFetchingNextPage}
              >
                {isFetchingNextPage ? "Загрузка…" : "Показать ещё"}
              </Button>
            </div>
          )}
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
                {filteredClinics.map((clinic, index) => (
                  <ClinicCard
                    key={`desk-${clinic.id}`}
                    {...clinic}
                    priority={index < 4}
                    initialSaved={isSaved(Number(clinic.id))}
                    onSave={() => toggle(Number(clinic.id))}
                  />
                ))}
              </div>
            )}

            {hasNextPage && (
              <div className="flex justify-center mt-8">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => fetchNextPage()}
                  loading={isFetchingNextPage}
                >
                  {isFetchingNextPage ? "Загрузка…" : "Показать ещё"}
                </Button>
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
