"use client";

import { FC, useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";

import { Footer } from "@/widgets/footer";
import { Header } from "@/widgets/header";

import { ActiveFiltersChips } from "@/features/active-filters-chips";
import { useFavoriteToggle } from "@/features/favorite-toggle";
import { FilterBar } from "@/features/filter-bar";
import { FiltersTrigger, MobileFiltersModal } from "@/features/mobile-filters";
import { UrlSearchInput } from "@/features/search-by-query";

import { DoctorCard, DoctorSkeleton } from "@/entities/doctor";

import { DoctorFilters, api, doctorKeys } from "@/shared/api";
import { ROUTES } from "@/shared/config";
import { useUrlSearchParams } from "@/shared/lib/url-state";
import { useCityStore } from "@/shared/store";
import { Button } from "@/shared/ui";

// Постраничная подгрузка: 8 врачей за раз, дальше — по кнопке «Показать ещё»
// (как на /clinics). specialization принимает несколько значений через
// запятую (проверено живыми запросами) — мультиселект уходит на бэк целиком,
// без клиентской доводки.
const PAGE_SIZE = 8;

type Props = {
  // City the server prefetched doctors for (from the city cookie).
  initialCity: string;
};

export const SpecialistsPage: FC<Props> = ({ initialCity }) => {
  const router = useRouter();
  const urlSearchParams = useUrlSearchParams();
  // 1. Читаем параметры из пропсов
  const activeQuery = urlSearchParams.get("q") ?? "";
  const isFiltersModalOpen = urlSearchParams.get("modal") === "filters";

  const currentSpec = urlSearchParams.get("doc_spec");
  const currentRating = urlSearchParams.get("doc_rating");
  const currentExp = urlSearchParams.get("doc_exp");
  const currentPrice = urlSearchParams.get("doc_price");

  const storeCity = useCityStore((s) => s.city);
  // Until the client store has hydrated, use the server-provided city so the
  // first render (and its query key) matches the SSR/dehydrated data. After
  // hydration we follow the store, so changing city in the header still works.
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    queueMicrotask(() => setIsHydrated(true));
  }, []);
  const selectedCity = isHydrated ? storeCity : initialCity;

  // 2. Собираем реальные фильтры и отдаём их API — город/онлайн/оценка/
  // цена/стаж/текстовый поиск/специализация (в т.ч. несколько через запятую)
  // реально сужают выборку на бэке.
  const [priceMin, priceMax] = currentPrice
    ? currentPrice.split("-").map(Number)
    : [undefined, undefined];
  const [expMin, expMax] = currentExp
    ? currentExp.split("-").map(Number)
    : [undefined, undefined];
  const selectedSpecs = currentSpec
    ? currentSpec.split(",").filter(Boolean)
    : [];

  const filters: Omit<DoctorFilters, "page_size" | "page"> = {
    city: selectedCity || undefined,
    min_rating:
      currentRating && currentRating !== "all"
        ? parseFloat(currentRating)
        : undefined,
    min_price: priceMin,
    max_price: priceMax,
    min_experience: expMin,
    max_experience: expMax,
    specialization:
      selectedSpecs.length > 0 ? selectedSpecs.join(",") : undefined,
    search: activeQuery || undefined,
  };

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: doctorKeys.list(filters),
      queryFn: ({ pageParam, signal }) =>
        api.getDoctorsPaginated(
          {
            ...filters,
            page: pageParam,
            page_size: PAGE_SIZE,
          },
          signal,
        ),
      initialPageParam: 1,
      placeholderData: keepPreviousData,
      retry: false,
      getNextPageParam: (lastPage) =>
        lastPage && lastPage.pagination.page < lastPage.pagination.total_pages
          ? lastPage.pagination.page + 1
          : undefined,
    });

  const doctors = data?.pages.flatMap((page) => page.data) ?? [];

  const { isSaved, toggle } = useFavoriteToggle("doctor");

  return (
    <main className="min-h-screen bg-background md:bg-white flex flex-col">
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
        specializationScope="doctor"
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
            <h2 className="text-foreground text-lg font-medium mb-4">
              Результаты по запросу: {activeQuery}
            </h2>
          )}

          <div className="flex flex-col gap-2">
            {isLoading ? (
              <DoctorSkeleton count={4} variant="horizontal" />
            ) : doctors.length === 0 ? (
              <p className="text-center text-muted py-10">
                По вашим параметрам врачи не найдены
              </p>
            ) : (
              doctors.map((doc) => (
                <DoctorCard
                  key={`mob-${doc.id}`}
                  {...doc}
                  variant="horizontal"
                  isSaved={isSaved(Number(doc.id))}
                  onSave={() => toggle(Number(doc.id))}
                  onBook={() =>
                    router.push(
                      ROUTES.RECORD_FOR_DOCTOR(doc.id, {
                        workplaces: doc.workplaces,
                      }),
                    )
                  }
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
                  href={ROUTES.SPECIALISTS}
                  className="hover:text-primary transition-colors"
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
                <span className="text-primary">По запросу «{activeQuery}»</span>
              </>
            )}
          </div>

          <FilterBar
            prefix="doc"
            specializationScope="doctor"
            title="Специалисты"
            fields={{
              specialty: true,
              experience: true,
              rating: true,
              price: true,
            }}
          />

          <div className="mt-2">
            {isLoading ? (
              <DoctorSkeleton count={8} variant="vertical" />
            ) : doctors.length === 0 ? (
              <p className="text-center text-muted py-20 text-lg">
                По вашим параметрам врачи не найдены
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-5 items-stretch">
                {doctors.map((doc) => (
                  <DoctorCard
                    key={`desk-${doc.id}`}
                    {...doc}
                    isSaved={isSaved(Number(doc.id))}
                    onSave={() => toggle(Number(doc.id))}
                    onBook={() =>
                      router.push(
                        ROUTES.RECORD_FOR_DOCTOR(doc.id, {
                          workplaces: doc.workplaces,
                        }),
                      )
                    }
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
