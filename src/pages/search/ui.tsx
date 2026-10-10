"use client";

import { FC, Suspense, useEffect, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useQuery } from "@tanstack/react-query";

import { Footer } from "@/widgets/footer";
import { Header } from "@/widgets/header";

import { ActiveFiltersChips } from "@/features/active-filters-chips";
import { useFavoriteToggle } from "@/features/favorite-toggle";
import { FilterBar } from "@/features/filter-bar";
import { CategoriesGrid, RecentSearches } from "@/features/global-search";
import { FiltersTrigger, MobileFiltersModal } from "@/features/mobile-filters";
import { UrlSearchInput } from "@/features/search-by-query";

import { ClinicCard } from "@/entities/clinic";
import { DoctorCard } from "@/entities/doctor";

import { DoctorFilters, api, doctorKeys } from "@/shared/api";
import { ROUTES } from "@/shared/config";
import { formatDuration, hasDuration } from "@/shared/lib/duration";
import { hasPrice } from "@/shared/lib/price";
import {
  clearFilterParams,
  hasFilterParams,
  replaceUrlState,
  useUrlSearchParams,
} from "@/shared/lib/url-state";
import { cn, plural } from "@/shared/lib/utils";
import { useCityStore } from "@/shared/store";
import { Button } from "@/shared/ui";

// Раньше блоки страницы (модалка фильтров, история, категории, футер,
// карточки выдачи) подключались через dynamic(). Здесь он только вредил: у
// него нет своей Suspense-границы, поэтому при переходе на /search вся
// страница ждала под скелетоном, пока чанки по одному, друг за другом, не
// доедут — три лишних круга по сети (около секунды на 4G) до первого кадра
// вкладки, и ещё столько же перед показом выдачи. Обычным импортом всё это
// попадает в чанк самой страницы, а его Next забирает заранее вместе с
// префетчем ссылки.

type Props = {
  // Город, под который сервер сделал префетч (из cookie, см.
  // app/search/page.tsx).
  initialCity: string;
};

export const SearchPage: FC<Props> = ({ initialCity }) => {
  const router = useRouter();
  const urlSearchParams = useUrlSearchParams();

  // Выдача — по выбранному пользователем городу. Без явного city бэк брал
  // город по IP запроса, а при серверном префетче это IP Netlify. Как на
  // /clinics: до гидрации стора — город из cookie, под который был префетч,
  // иначе ключи запросов разойдутся с серверными.
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
  const city = (isHydrated ? storeCity : initialCity) || undefined;
  // 1. Читаем параметры
  const activeQuery = urlSearchParams.get("q") ?? "";
  const isFiltersModalOpen = urlSearchParams.get("modal") === "filters";

  const currentSpec = urlSearchParams.get("doc_spec");
  const currentRating = urlSearchParams.get("doc_rating");
  const currentExp = urlSearchParams.get("doc_exp");
  const currentPrice = urlSearchParams.get("doc_price");

  // Врачи: город/оценка/цена/стаж/текст и список специализаций уходят в API.
  const [priceMin, priceMax] = currentPrice
    ? currentPrice.split("-").map(Number)
    : [undefined, undefined];
  const [expMin, expMax] = currentExp
    ? currentExp.split("-").map(Number)
    : [undefined, undefined];
  const selectedSpecs = currentSpec
    ? currentSpec.split(",").filter(Boolean)
    : [];

  const doctorFilters: DoctorFilters = {
    city,
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
    page_size: 24,
  };

  // 2. ПОЛУЧАЕМ ВСЕ ДАННЫЕ С СЕРВЕРА
  // Избранное на странице поиска не было подключено: сердечки на найденных
  // врачах и клиниках не закрашивались и по клику ничего не сохраняли.
  const doctorFavorites = useFavoriteToggle("doctor");
  const clinicFavorites = useFavoriteToggle("clinic");

  const { data: doctors = [], isLoading: isDocsLoading } = useQuery({
    queryKey: doctorKeys.list(doctorFilters),
    queryFn: ({ signal }) => api.getDoctors(doctorFilters, signal),
    enabled: Boolean(activeQuery),
    retry: false,
  });

  const search = activeQuery || undefined;
  // Выбранные специализации сужают и клиники: раньше фильтр действовал только
  // на врачей, а клиники под ним оставались все. Без специализации ключ
  // прежний — его же префетчит app/search/page.tsx.
  const clinicSpecialization = doctorFilters.specialization;
  const { data: clinics = [], isLoading: isClinicsLoading } = useQuery({
    queryKey: clinicSpecialization
      ? ["search-clinics", activeQuery, city, clinicSpecialization]
      : ["search-clinics", activeQuery, city],
    queryFn: ({ signal }) =>
      api.getClinics(
        {
          search,
          city,
          specialization: clinicSpecialization,
          page_size: 12,
        },
        signal,
      ),
    enabled: Boolean(activeQuery),
    retry: false,
  });

  const { data: services = [], isLoading: isServicesLoading } = useQuery({
    queryKey: ["search-services", activeQuery, city],
    queryFn: ({ signal }) =>
      api.getServices({ search, city, page_size: 20 }, signal),
    enabled: Boolean(activeQuery),
    retry: false,
  });

  const isLoading = isDocsLoading || isClinicsLoading || isServicesLoading;

  // 3. ФИЛЬТРУЕМ ДАННЫЕ НА ЛЕТУ ПО ЗАПРОСУ И ФИЛЬТРАМ

  // --- ФИЛЬТР ВРАЧЕЙ --- список специализаций уже обработан API.
  const filteredDoctors = doctors;

  // --- ФИЛЬТР КЛИНИК --- поиск по названию и специализациям делает API.
  // Повторная проверка здесь смотрела только основные специализации и
  // выбрасывала клиники, найденные бэком по узким.
  const filteredClinics = activeQuery ? clinics : [];

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

  // Фильтры врачей заданы. Если по ним 0 врачей, на десктопе раньше пропадал
  // весь блок «Врачи» вместе с FilterBar, а чипы и кнопка фильтров живут в
  // шапке только на мобильном — снять фильтр было негде (а «Назад» уводит со
  // страницы: фильтры пишутся через replaceState).
  const hasDoctorFilters = hasFilterParams("doc", urlSearchParams);
  const resetDoctorFilters = () =>
    replaceUrlState(clearFilterParams("doc", urlSearchParams));

  return (
    <main className="min-h-screen bg-background md:bg-white flex flex-col pb-16 lg:pb-0">
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
        specializationScope="doctor"
        fields={{
          specialty: true,
          experience: true,
          rating: true,
          price: true,
        }}
      />

      <div className="flex-1 w-full max-w-360 mx-auto pb-10">
        {/* Десктопное поле запроса — одно на все состояния и вне ветки
            загрузки. Раньше при непустом запросе его не было вовсе (поменять
            слово можно было лишь новым поиском из шапки), а поле внутри
            выдачи размонтировалось бы на «Выполняем поиск...» сразу после
            ввода (q пишется с задержкой) — и терялись фокус и набор. */}
        <div
          className={cn(
            "hidden md:block px-10",
            activeQuery ? "pt-6" : "pt-16 max-w-200 mx-auto w-full",
          )}
        >
          {activeQuery && (
            <div className="text-sm text-secondary mb-6 flex items-center gap-2">
              <Link
                href={ROUTES.HOME}
                className="hover:text-primary transition-colors"
              >
                Главная
              </Link>
              <span>•</span>
              <span className="text-primary">По запросу «{activeQuery}»</span>
            </div>
          )}
          <div className="mb-8 max-w-200 drop-shadow-sm rounded-full">
            <Suspense
              fallback={
                <div className="h-13 w-full bg-gray-100 rounded-full" />
              }
            >
              <UrlSearchInput />
            </Suspense>
          </div>
        </div>

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

                {/* Десктопная ветка ниже уже объясняет пустой результат —
                    на мобильном стояло голое «Ничего не найдено», из которого
                    не было понятно, виноват запрос или фильтры. */}
                {!hasAnyResults && (
                  <div className="py-10 flex flex-col items-center gap-2 text-center">
                    <p className="text-foreground font-medium">
                      Ничего не найдено
                    </p>
                    <p className="text-muted text-sm max-w-70">
                      По запросу «{activeQuery}» совпадений нет. Попробуйте
                      другое слово или снимите фильтры.
                    </p>
                    {hasDoctorFilters && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={resetDoctorFilters}
                      >
                        Сбросить фильтры
                      </Button>
                    )}
                  </div>
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
                          isSaved={doctorFavorites.isSaved(Number(doc.id))}
                          isPending={doctorFavorites.isPending(Number(doc.id))}
                          onSave={() => doctorFavorites.toggle(Number(doc.id))}
                          variant="horizontal"
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
                          isSaved={clinicFavorites.isSaved(Number(clinic.id))}
                          isPending={clinicFavorites.isPending(
                            Number(clinic.id),
                          )}
                          onSave={() =>
                            clinicFavorites.toggle(Number(clinic.id))
                          }
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
                              {hasDuration(service.duration) &&
                                ` • ${formatDuration(service.duration)}`}
                            </p>
                          </div>
                          {hasPrice(service.price) && (
                            <div className="font-bold text-foreground text-sm">
                              {service.price} с
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* === ДЕСКТОПНАЯ ВЕРСИЯ РЕЗУЛЬТАТОВ === */}
              <div className="hidden md:block px-10 pb-6">
                {!hasAnyResults && !hasDoctorFilters ? (
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
                    {/* Секция Врачей с фильтрами. При заданных фильтрах
                        остаётся и с нулём врачей — иначе вместе с ней
                        пропадала бы и кнопка «Сбросить фильтры». */}
                    {(filteredDoctors.length > 0 || hasDoctorFilters) && (
                      <div>
                        <FilterBar
                          prefix="doc"
                          specializationScope="doctor"
                          fields={{
                            specialty: true,
                            experience: true,
                            rating: true,
                            price: true,
                          }}
                        >
                          <div className="flex items-end gap-3 mb-6">
                            <h2 className="text-[32px] font-semibold text-foreground leading-none">
                              Врачи
                            </h2>
                            <span className="text-muted text-lg pb-1">
                              {filteredDoctors.length}{" "}
                              {plural(
                                filteredDoctors.length,
                                "совпадение",
                                "совпадения",
                                "совпадений",
                              )}
                            </span>
                          </div>
                        </FilterBar>
                        <div className="grid grid-cols-4 gap-5 mt-2">
                          {filteredDoctors.map((doc) => (
                            <DoctorCard
                              key={`desk-doc-${doc.id}`}
                              {...doc}
                              isSaved={doctorFavorites.isSaved(Number(doc.id))}
                              isPending={doctorFavorites.isPending(
                                Number(doc.id),
                              )}
                              onSave={() =>
                                doctorFavorites.toggle(Number(doc.id))
                              }
                              variant="vertical"
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
                        {filteredDoctors.length === 0 && (
                          <div className="py-10 flex flex-col items-center gap-4 text-center">
                            <p className="text-muted text-lg">
                              С такими фильтрами врачи не найдены
                            </p>
                            <Button
                              variant="outline"
                              size="md"
                              onClick={resetDoctorFilters}
                            >
                              Сбросить фильтры
                            </Button>
                          </div>
                        )}
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
                            {filteredClinics.length}{" "}
                            {plural(
                              filteredClinics.length,
                              "совпадение",
                              "совпадения",
                              "совпадений",
                            )}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-5 items-stretch">
                          {filteredClinics.map((clinic) => (
                            <ClinicCard
                              key={`desk-clinic-${clinic.id}`}
                              {...clinic}
                              isSaved={clinicFavorites.isSaved(
                                Number(clinic.id),
                              )}
                              isPending={clinicFavorites.isPending(
                                Number(clinic.id),
                              )}
                              onSave={() =>
                                clinicFavorites.toggle(Number(clinic.id))
                              }
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
                            {filteredServices.length}{" "}
                            {plural(
                              filteredServices.length,
                              "совпадение",
                              "совпадения",
                              "совпадений",
                            )}
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
                                {hasDuration(service.duration) &&
                                  ` • ${formatDuration(service.duration)}`}
                              </p>
                              <div className="flex items-center justify-between mt-auto">
                                {hasPrice(service.price) && (
                                  <span className="font-bold text-foreground text-lg">
                                    {service.price} с
                                  </span>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="ml-auto"
                                >
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
          <div className="px-4 md:px-10 pt-6 md:pt-0 max-w-200 mx-auto w-full">
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
