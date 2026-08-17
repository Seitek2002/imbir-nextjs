"use client";

import { FC } from "react";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { Footer } from "@/widgets/footer";
import { Header } from "@/widgets/header";

import { ActiveFiltersChips } from "@/features/active-filters-chips";
import { useFavoriteToggle } from "@/features/favorite-toggle";
import { FiltersTrigger, MobileFiltersModal } from "@/features/mobile-filters";
import { UrlSearchInput } from "@/features/search-by-query";

import { ServiceCard, useServiceCategories } from "@/entities/service";

import { ServiceFilters, api, serviceKeys } from "@/shared/api";
import { RemoveIcon } from "@/shared/assets/icons";
import { ROUTES } from "@/shared/config";
import { useCityStore } from "@/shared/store";
import { Button, Dropdown, RangeSlider } from "@/shared/ui";

const MAX_PRICE = 10000;
// Постраничная подгрузка: 8 услуг за раз, дальше — по кнопке «Показать ещё»
// (как на /clinics и /specialists). Текстовый поиск бэк не поддерживает
// (проверено напрямую — search ни на что не влияет), поэтому activeQuery
// остаётся клиентским и фильтрует только уже подгруженные страницы.
const PAGE_SIZE = 8;
// Оценка и клиника раньше были заглушкой «скоро»: считалось, что бэк не отдаёт
// эти поля. Сейчас отдаёт (clinic целым объектом, rating числом) и принимает
// clinic_id/min_rating как query-параметры — проверено прямыми запросами.
const RATING_OPTIONS = [
  { value: "all", label: "Все" },
  { value: "5.0", label: "5.0" },
  { value: "4.0", label: "4.0" },
  { value: "3.0", label: "3.0" },
];

const PREFIX = "svc";

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export const ServicesPage: FC<Props> = ({ searchParams }) => {
  const router = useRouter();
  const urlSearchParams = useSearchParams() ?? new URLSearchParams();

  const isFiltersModalOpen = searchParams?.modal === "filters";
  const activeQuery = typeof searchParams?.q === "string" ? searchParams.q : "";

  const currentCategory = urlSearchParams.get(`${PREFIX}_spec`) ?? null;
  const currentClinic = urlSearchParams.get(`${PREFIX}_clinic`) ?? null;
  const currentRating = urlSearchParams.get(`${PREFIX}_rating`) ?? null;
  const priceParts = urlSearchParams
    .get(`${PREFIX}_price`)
    ?.split("-")
    .map(Number);
  const priceRange: [number, number] = [
    priceParts?.[0] ?? 0,
    priceParts?.[1] ?? MAX_PRICE,
  ];

  const updateURL = (key: string, value: string | null) => {
    const params = new URLSearchParams(urlSearchParams.toString());
    if (value) {
      params.set(`${PREFIX}_${key}`, value);
    } else {
      params.delete(`${PREFIX}_${key}`);
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleReset = () => {
    const params = new URLSearchParams(urlSearchParams.toString());
    params.delete(`${PREFIX}_spec`);
    params.delete(`${PREFIX}_price`);
    params.delete(`${PREFIX}_clinic`);
    params.delete(`${PREFIX}_rating`);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  // Категория, клиника, оценка и цена — реальные query-параметры
  // /api/services/ (проверено прямыми запросами).
  const filters: Omit<ServiceFilters, "page" | "page_size"> = {
    category: currentCategory ?? undefined,
    clinic_id: currentClinic ?? undefined,
    min_rating:
      currentRating && currentRating !== "all"
        ? parseFloat(currentRating)
        : undefined,
    min_price: priceParts ? priceRange[0] : undefined,
    max_price: priceParts ? priceRange[1] : undefined,
  };

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: serviceKeys.list(filters),
      queryFn: ({ pageParam }) =>
        api.getServicesPaginated({
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

  const services = data?.pages.flatMap((page) => page.data) ?? [];

  // Текстовый поиск — клиентский, фильтрует только уже подгруженные страницы
  // (см. комментарий у PAGE_SIZE).
  const filteredServices = services.filter((s) => {
    if (activeQuery) {
      const q = activeQuery.toLowerCase();
      if (
        !s.name.toLowerCase().includes(q) &&
        !s.category.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  const mobileFilters = {
    category: true as const,
    clinic: true as const,
    rating: true as const,
    price: true as const,
  };

  const { isSaved, toggle } = useFavoriteToggle("service");

  // Категории — из реальных услуг, справочника у бэка нет
  const { options: categoryOptions } = useServiceCategories();

  // Клиники для фильтра: значением уходит id, его и принимает clinic_id.
  const { data: clinics = [] } = useQuery({
    queryKey: ["clinics"],
    queryFn: () => api.getClinics(),
    staleTime: 60 * 60 * 1000,
  });
  const clinicOptions = clinics.map((clinic) => ({
    value: String(clinic.id),
    label: clinic.name,
  }));

  const city = useCityStore((s) => s.city);

  return (
    <main className="min-h-screen bg-background md:bg-white flex flex-col">
      <Header title="Услуги" backTo={ROUTES.HOME}>
        <div className="flex gap-3 items-center mt-3 md:mt-0 md:block">
          <div className="flex-1">
            <UrlSearchInput placeholder="Поиск услуги" />
          </div>
          <div className="md:hidden">
            <FiltersTrigger />
          </div>
        </div>
        <ActiveFiltersChips prefix={PREFIX} />
      </Header>

      <MobileFiltersModal
        isOpen={isFiltersModalOpen}
        prefix={PREFIX}
        fields={mobileFilters}
        categoryOptions={categoryOptions}
        clinicOptions={clinicOptions}
      />

      <div className="flex-1 w-full max-w-360 mx-auto pb-10">
        {/* Mobile */}
        <div className="md:hidden p-4">
          {activeQuery && (
            <h2 className="text-foreground text-lg font-medium mb-4">
              Результаты по запросу: {activeQuery}
            </h2>
          )}

          <div className="flex flex-col gap-2">
            {isLoading ? (
              <p className="text-center text-muted py-10">Загрузка...</p>
            ) : filteredServices.length === 0 ? (
              <p className="text-center text-muted py-10">
                По вашим параметрам услуги не найдены
              </p>
            ) : (
              filteredServices.map((s) => (
                <ServiceCard
                  key={s.id}
                  id={s.id}
                  name={s.name}
                  category={s.category}
                  clinic={s.clinicName}
                  clinicId={s.clinicId}
                  rating={s.rating}
                  reviews={s.reviews}
                  price={s.price}
                  image={s.image}
                  variant="horizontal"
                  isSaved={isSaved(Number(s.id))}
                  onSave={() => toggle(Number(s.id))}
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

        {/* Desktop */}
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
                  href={ROUTES.SERVICES}
                  className="hover:text-primary transition-colors"
                >
                  Услуги
                </Link>
              ) : (
                "Услуги"
              )}
            </span>
            {activeQuery && (
              <>
                <span>•</span>
                <span className="text-primary">По запросу «{activeQuery}»</span>
              </>
            )}
          </div>

          <div className="max-w-200">
            <div className="flex items-center gap-3">
              <h2 className="text-[40px] font-semibold leading-none">Услуги</h2>
              {city && (
                <span className="inline-flex items-center text-xs font-medium text-primary bg-[#FFF0EE] px-3 py-1 rounded-full border border-primary/20 shrink-0 self-center">
                  в г. {city}
                </span>
              )}
            </div>
            <p className="text-secondary text-lg mt-4 mb-6">
              Поиск в г.{" "}
              <span className="font-medium text-foreground">{city}</span>.
              Выберите интересующие вас параметры, чтобы ознакомиться с
              подходящими процедурами
            </p>
          </div>

          <div className="grid grid-cols-4 gap-5 items-start">
            <Dropdown
              label="Услуга"
              placeholder="Все"
              options={categoryOptions}
              value={currentCategory ?? ""}
              onChange={(val) => updateURL("spec", val || null)}
            />
            <Dropdown
              label="Клиника"
              placeholder="Все"
              options={clinicOptions}
              searchable
              value={currentClinic ?? ""}
              onChange={(val) => updateURL("clinic", val || null)}
            />
            <Dropdown
              label="Оценка"
              placeholder="Все"
              options={RATING_OPTIONS}
              value={currentRating ?? ""}
              onChange={(val) =>
                updateURL("rating", val === "all" ? null : val || null)
              }
            />
            <RangeSlider
              id="price-desktop-svc"
              label="Стоимость, с"
              min={0}
              max={MAX_PRICE}
              step={50}
              value={priceRange}
              onChange={(val) => updateURL("price", `${val[0]}-${val[1]}`)}
              className="bg-white"
            />
          </div>

          <div className="flex justify-end mt-6">
            <Button
              IconLeft={RemoveIcon}
              variant="text"
              size="sm"
              onClick={handleReset}
            >
              Сбросить фильтры
            </Button>
          </div>

          <div className="mt-2">
            {isLoading ? (
              <p className="text-center text-muted py-20 text-lg">
                Загрузка...
              </p>
            ) : filteredServices.length === 0 ? (
              <p className="text-center text-muted py-20 text-lg">
                По вашим параметрам услуги не найдены
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-5 items-stretch">
                {filteredServices.map((s) => (
                  <ServiceCard
                    key={s.id}
                    id={s.id}
                    name={s.name}
                    category={s.category}
                    clinic={s.clinicName}
                    clinicId={s.clinicId}
                    rating={s.rating}
                    reviews={s.reviews}
                    price={s.price}
                    image={s.image}
                    isSaved={isSaved(Number(s.id))}
                    onSave={() => toggle(Number(s.id))}
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
