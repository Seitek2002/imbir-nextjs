"use client";

import { FC, useEffect, useState } from "react";

import Link from "next/link";

import { useQuery } from "@tanstack/react-query";

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
import { useCityStore } from "@/shared/store";

// Бэк не поддерживает фильтр по стажу (нет такого query-параметра в
// /api/doctors/), а фильтр specialization есть в контракте, но на практике
// всегда возвращает пустой список даже для точных совпадений (проверено
// прямыми запросами) — это баг бэкенда. Оставляем оба фильтра клиентскими.
// page_size увеличен, чтобы клиентская фильтрация не резала выборку до
// дефолтных 20 записей (макет не предполагает пагинацию — карточки не
// ограничены страницами).
const FULL_LIST_PAGE_SIZE = 200;

// <-- ИМПОРТ НАШЕГО API

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
  // City the server prefetched doctors for (from the city cookie).
  initialCity: string;
};

export const SpecialistsPage: FC<Props> = ({ searchParams, initialCity }) => {
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

  const storeCity = useCityStore((s) => s.city);
  // Until the client store has hydrated, use the server-provided city so the
  // first render (and its query key) matches the SSR/dehydrated data. After
  // hydration we follow the store, so changing city in the header still works.
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    queueMicrotask(() => setIsHydrated(true));
  }, []);
  const selectedCity = isHydrated ? storeCity : initialCity;

  // 2. Собираем реальные фильтры и отдаём их API — специализация/стаж
  // остаются клиентскими (см. комментарий у FULL_LIST_PAGE_SIZE), город/
  // онлайн/оценка/цена уходят в query-параметры и реально сужают выборку
  // на бэке.
  const [priceMin, priceMax] = currentPrice
    ? currentPrice.split("-").map(Number)
    : [undefined, undefined];

  const filters: DoctorFilters = {
    city: selectedCity || undefined,
    is_online: isOnlineOnly || undefined,
    min_rating:
      currentRating && currentRating !== "all"
        ? parseFloat(currentRating)
        : undefined,
    min_price: priceMin,
    max_price: priceMax,
    page_size: FULL_LIST_PAGE_SIZE,
  };

  const { data: doctors = [], isLoading } = useQuery({
    queryKey: doctorKeys.list(filters),
    queryFn: () => api.getDoctors(filters),
  });

  // 3. Специализация и стаж — фильтруем на клиенте (бэк их не поддерживает
  // рабочим образом), плюс текстовый поиск.
  const filteredDoctors = doctors.filter((doc) => {
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

    if (currentExp) {
      const [minExp, maxExp] = currentExp.split("-").map(Number);
      if (doc.experience < minExp || doc.experience > maxExp) return false;
    }

    return true;
  });

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
            <h2 className="text-foreground text-lg font-medium mb-4">
              Результаты по запросу: {activeQuery}
            </h2>
          )}

          <div className="flex flex-col gap-2">
            {isLoading ? (
              <DoctorSkeleton count={4} variant="horizontal" />
            ) : filteredDoctors.length === 0 ? (
              <p className="text-center text-muted py-10">
                По вашим параметрам врачи не найдены
              </p>
            ) : (
              filteredDoctors.map((doc) => (
                <DoctorCard
                  key={`mob-${doc.id}`}
                  {...doc}
                  variant="horizontal"
                  initialSaved={isSaved(Number(doc.id))}
                  onSave={() => toggle(Number(doc.id))}
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
              <p className="text-center text-muted py-20 text-lg">
                По вашим параметрам врачи не найдены
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-5 items-stretch">
                {filteredDoctors.map((doc) => (
                  <DoctorCard
                    key={`desk-${doc.id}`}
                    {...doc}
                    initialSaved={isSaved(Number(doc.id))}
                    onSave={() => toggle(Number(doc.id))}
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
