"use client";

import { FC, useEffect, useState } from "react";

import Link from "next/link";

import {
  keepPreviousData,
  useInfiniteQuery,
  useQuery,
} from "@tanstack/react-query";

import { Footer } from "@/widgets/footer";
import { Header } from "@/widgets/header";

import { ActiveFiltersChips } from "@/features/active-filters-chips";
import { useFavoriteToggle } from "@/features/favorite-toggle";
import { FiltersTrigger, MobileFiltersModal } from "@/features/mobile-filters";
import { UrlSearchInput } from "@/features/search-by-query";

import {
  ServiceCard,
  ServiceSkeleton,
  useServiceCategories,
} from "@/entities/service";

import {
  ClinicFilters,
  ServiceFilters,
  api,
  clinicKeys,
  serviceKeys,
} from "@/shared/api";
import { ChatIcon, RemoveIcon } from "@/shared/assets/icons";
import { ROUTES } from "@/shared/config";
import {
  clearFilterParams,
  hasFilterParams,
  replaceUrlState,
  useUrlSearchParams,
} from "@/shared/lib/url-state";
import { cn } from "@/shared/lib/utils";
import { useCityStore } from "@/shared/store";
import { Button, Dropdown, EmptyState, RangeSlider } from "@/shared/ui";

// Правый край ползунка цены — «и дороже»: на нём max_price не отправляем.
// Должно совпадать с app/services/page.tsx.
const MAX_PRICE = 10000;
// Постраничная подгрузка: 8 услуг за раз, дальше — по кнопке «Показать ещё»
// (как на /clinics и /specialists). Текстовый поиск уходит в API (search):
// раньше он фильтровал на клиенте только уже подгруженные 8 карточек.
const PAGE_SIZE = 8;
// Клиник для фильтра «Клиника» — сколько отдаёт бэк за раз (max_page_size).
const CLINIC_OPTIONS_PAGE_SIZE = 100;
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
  // Город, под который сервер сделал префетч (из cookie, см.
  // app/services/page.tsx).
  initialCity: string;
};

// См. FilterBar: null — весь диапазон, "500" — от 500 без верхней границы.
const formatPriceRange = ([min, max]: [number, number]): null | string => {
  if (max >= MAX_PRICE) return min > 0 ? String(min) : null;
  return `${min}-${max}`;
};

// Один на оба макета. Кнопка сброса появляется только когда фильтры
// действительно заданы: предлагать «сбросить» при пустом адресе бессмысленно.
const CatalogEmptyState = () => {
  const params = useUrlSearchParams();
  const filtered = hasFilterParams(PREFIX, params);
  // Текстовый поиск теперь идёт через API — пустая выдача по запросу не
  // значит, что раздел пуст.
  const query = params.get("q");

  return (
    <EmptyState
      icon={<ChatIcon className="size-6" />}
      title={filtered || query ? "Услуги не найдены" : "Здесь пока пусто"}
      description={
        filtered
          ? "Под выбранные условия ничего не подошло. Попробуйте расширить диапазон цены или снять категорию."
          : query
            ? `По запросу «${query}» ничего не нашлось. Попробуйте другое слово.`
            : "Список пополняется. Загляните позже или посмотрите другие разделы."
      }
      action={
        filtered ? (
          <Button
            size="md"
            variant="outline"
            onClick={() => replaceUrlState(clearFilterParams(PREFIX, params))}
          >
            Сбросить фильтры
          </Button>
        ) : undefined
      }
    />
  );
};

export const ServicesPage: FC<Props> = ({ initialCity }) => {
  // useUrlSearchParams, а не useSearchParams/searchParams из next: строка
  // поиска, кнопка и модалка фильтров меняют адрес нативным history API, и
  // хук Next об этом не узнаёт — запрос и мобильные фильтры до списка не
  // доходили, а router.replace с устаревшими параметрами терял введённый q.
  const urlSearchParams = useUrlSearchParams();

  const isFiltersModalOpen = urlSearchParams.get("modal") === "filters";
  const activeQuery = urlSearchParams.get("q") ?? "";

  // Как на /clinics: до гидрации стора — город из cookie, под который сервер
  // сделал префетч, иначе ключ первого запроса разойдётся с серверным.
  const storeCity = useCityStore((s) => s.city);
  const [isHydrated, setIsHydrated] = useState(false);
  useEffect(() => {
    if (useCityStore.persist.hasHydrated()) {
      // См. ClinicsPage: гидрация могла закончиться до маунта.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsHydrated(true);
      return;
    }
    return useCityStore.persist.onFinishHydration(() => setIsHydrated(true));
  }, []);
  const city = isHydrated ? storeCity : initialCity;

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

  const updateURL = (key: string, value: null | string) => {
    const params = new URLSearchParams(urlSearchParams.toString());
    if (value) {
      params.set(`${PREFIX}_${key}`, value);
    } else {
      params.delete(`${PREFIX}_${key}`);
    }
    replaceUrlState(params);
  };

  const handleReset = () => {
    replaceUrlState(clearFilterParams(PREFIX, urlSearchParams));
  };

  // Город, текст, категория, клиника, оценка и цена — реальные
  // query-параметры /api/services/. Смена любого — новый ключ, то есть
  // загрузка с первой страницы. Порядок и значения — как в
  // app/services/page.tsx, иначе серверный префетч не подхватится.
  const filters: Omit<ServiceFilters, "page_size" | "page"> = {
    city: city || undefined,
    search: activeQuery || undefined,
    category: currentCategory ?? undefined,
    clinic_id: currentClinic ?? undefined,
    min_rating:
      currentRating && currentRating !== "all"
        ? parseFloat(currentRating)
        : undefined,
    min_price: priceParts ? priceRange[0] : undefined,
    max_price:
      priceParts && priceRange[1] < MAX_PRICE ? priceRange[1] : undefined,
  };

  const {
    data,
    isLoading,
    isPlaceholderData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
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
    // Смена фильтра — это новый ключ запроса, то есть пустой кэш: сетка
    // исчезала и на её месте появлялось «Загрузка...». Оставляем предыдущий
    // список на экране (приглушённым), пока едет новый — так ожидание
    // короче на вид и страница не прыгает.
    placeholderData: keepPreviousData,
  });

  const filteredServices = data?.pages.flatMap((page) => page.data) ?? [];

  const mobileFilters = {
    category: true as const,
    clinic: true as const,
    rating: true as const,
    price: true as const,
  };

  const { isSaved, isPending, toggle } = useFavoriteToggle("service");

  // Только категории, у которых есть услуги: полный набор из формы создания
  // дал бы в фильтре варианты с пустой выдачей.
  const { usedOptions: categoryOptions } = useServiceCategories();

  // Клиники для фильтра: значением уходит id, его и принимает clinic_id.
  // Только клиники выбранного города и не первые 20 (размер страницы по
  // умолчанию), а сколько бэк отдаёт за раз.
  const clinicFilters: ClinicFilters = {
    city: city || undefined,
    page_size: CLINIC_OPTIONS_PAGE_SIZE,
  };
  const { data: clinics = [] } = useQuery({
    queryKey: clinicKeys.list(clinicFilters),
    queryFn: () => api.getClinics(clinicFilters),
    staleTime: 60 * 60 * 1000,
  });
  const clinicOptions = clinics.map((clinic) => ({
    value: String(clinic.id),
    label: clinic.name,
  }));

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
        maxPrice={MAX_PRICE}
      />

      <div className="flex-1 w-full max-w-360 mx-auto pb-10">
        {/* Mobile */}
        <div className="md:hidden p-4">
          {activeQuery && (
            <h2 className="text-foreground text-lg font-medium mb-4">
              Результаты по запросу: {activeQuery}
            </h2>
          )}

          <div
            className={cn(
              "flex flex-col gap-2 transition-opacity",
              // Данные ещё едут, а на экране предыдущий список — показываем это
              // прозрачностью, чтобы было видно, что фильтр применяется.
              isPlaceholderData && "opacity-50",
            )}
          >
            {isLoading ? (
              <ServiceSkeleton count={4} variant="horizontal" />
            ) : filteredServices.length === 0 ? (
              <CatalogEmptyState />
            ) : (
              filteredServices.map((s, index) => (
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
                  duration={s.duration}
                  image={s.image}
                  priority={index === 0}
                  variant="horizontal"
                  isSaved={isSaved(Number(s.id))}
                  isPending={isPending(Number(s.id))}
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
            </div>
            <p className="text-secondary text-lg mt-4 mb-6">
              Поиск в г.{" "}
              <span className="font-medium text-foreground">{city}</span>.
              Выберите интересующие вас параметры, чтобы ознакомиться с
              подходящими процедурами
            </p>
          </div>

          <div className="grid grid-cols-4 gap-5 items-start">
            {/* Не «Услуга»: на странице с заголовком «Услуги» такая подпись
                читалась как «выберите конкретную услугу», хотя в списке
                категории из /references/service-categories/. Так же подписаны поля
                в формах создания услуги и процедуры. */}
            <Dropdown
              label="Категория услуги"
              placeholder="Все"
              options={categoryOptions}
              searchable
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
              // onChangeEnd, а не onChange: onChange срабатывает на КАЖДЫЙ шаг
              // ползунка (50 сом), и каждый шаг переписывал URL. Так как
              // фильтры живут в адресе, а /services — серверный компонент,
              // одно перетаскивание давало до двух сотен обращений к серверу;
              // они выстраивались в очередь, и список догонял пользователя
              // через 3–5 секунд. Теперь запрос один — по отпусканию ползунка.
              onChangeEnd={(val) => updateURL("price", formatPriceRange(val))}
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

          <div
            className={cn(
              "mt-2 transition-opacity",
              isPlaceholderData && "opacity-50",
            )}
          >
            {isLoading ? (
              <ServiceSkeleton count={8} />
            ) : filteredServices.length === 0 ? (
              <CatalogEmptyState />
            ) : (
              <div className="grid grid-cols-4 gap-5 items-stretch">
                {filteredServices.map((s, index) => (
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
                    duration={s.duration}
                    image={s.image}
                    priority={index === 0}
                    isSaved={isSaved(Number(s.id))}
                    isPending={isPending(Number(s.id))}
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
