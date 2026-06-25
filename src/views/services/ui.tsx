"use client";

import { FC } from "react";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { useQuery } from "@tanstack/react-query";

import { Footer } from "@/widgets/footer";
import { Header } from "@/widgets/header";

import { ActiveFiltersChips } from "@/features/active-filters-chips";
import { FiltersTrigger, MobileFiltersModal } from "@/features/mobile-filters";
import { UrlSearchInput } from "@/features/search-by-query";

import { ServiceCard } from "@/entities/service";

import { api } from "@/shared/api/requests";
import { RemoveIcon } from "@/shared/assets/icons";
import { ROUTES } from "@/shared/config/routes";
import { Button, Dropdown, RangeSlider } from "@/shared/ui";

const MAX_PRICE = 10000;

const CATEGORY_OPTIONS = [
  { value: "Кардиология", label: "Кардиология" },
  { value: "Педиатрия", label: "Педиатрия" },
  { value: "Неврология", label: "Неврология" },
  { value: "Хирургия", label: "Хирургия" },
  { value: "Диагностика", label: "Диагностика" },
];

const CLINIC_OPTIONS = [
  { value: "Nova Clinic", label: "Nova Clinic" },
  { value: "MedCenter", label: "MedCenter" },
  { value: "Vita Clinic", label: "Vita Clinic" },
];

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
  const urlSearchParams = useSearchParams();

  const isFiltersModalOpen = searchParams?.modal === "filters";
  const activeQuery = typeof searchParams?.q === "string" ? searchParams.q : "";

  const currentCategory = urlSearchParams.get(`${PREFIX}_spec`) ?? null;
  const currentClinic = urlSearchParams.get(`${PREFIX}_clinic`) ?? null;
  const currentRating = urlSearchParams.get(`${PREFIX}_rating`) ?? "all";
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
    params.delete(`${PREFIX}_clinic`);
    params.delete(`${PREFIX}_rating`);
    params.delete(`${PREFIX}_price`);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: api.getServices,
  });

  const filteredServices = services.filter((s) => {
    if (activeQuery) {
      const q = activeQuery.toLowerCase();
      if (
        !s.name.toLowerCase().includes(q) &&
        !s.category.toLowerCase().includes(q)
      )
        return false;
    }
    if (currentCategory && s.category !== currentCategory) return false;
    if (currentClinic && s.clinicId !== currentClinic) return false;
    if (currentRating && currentRating !== "all") {
      if (s.rating < parseFloat(currentRating)) return false;
    }
    if (priceParts && (s.price < priceRange[0] || s.price > priceRange[1]))
      return false;
    return true;
  });

  const mobileFilters = {
    category: true as const,
    clinic: true as const,
    rating: true as const,
    price: true as const,
  };

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
        categoryOptions={CATEGORY_OPTIONS}
        clinicOptions={CLINIC_OPTIONS}
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
                />
              ))
            )}
          </div>

          {!isLoading && filteredServices.length > 0 && (
            <Button
              variant="outline"
              className="w-full mt-6 bg-white justify-center"
            >
              Показать еще
            </Button>
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
            <h2 className="text-[40px] font-semibold">Услуги</h2>
            <p className="text-secondary text-lg mt-4 mb-6">
              Выберите интересующие вас параметры, чтобы ознакомиться с
              подходящими процедурами
            </p>
          </div>

          <div className="grid grid-cols-4 gap-5 items-start">
            <Dropdown
              label="Услуга"
              placeholder="Все"
              options={CATEGORY_OPTIONS}
              value={currentCategory ?? ""}
              onChange={(val) => updateURL("spec", val || null)}
            />
            <Dropdown
              label="Клиника"
              placeholder="Все"
              options={CLINIC_OPTIONS}
              value={currentClinic ?? ""}
              onChange={(val) => updateURL("clinic", val || null)}
            />
            <Dropdown
              label="Оценка"
              placeholder="Все"
              type="radio"
              options={RATING_OPTIONS}
              value={currentRating || "all"}
              onChange={(val) =>
                updateURL("rating", val === "all" ? null : val)
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
                  />
                ))}
              </div>
            )}
          </div>

          {!isLoading && filteredServices.length > 0 && (
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
