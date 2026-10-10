"use client";

import { FC, Suspense } from "react";

import Link from "next/link";

import { useQuery } from "@tanstack/react-query";

import { useFavoriteToggle } from "@/features/favorite-toggle";
import { FilterBar } from "@/features/filter-bar";

import { ClinicCard, ClinicSkeleton } from "@/entities/clinic";

import { ClinicFilters, api, clinicKeys } from "@/shared/api";
import { useUrlSearchParams } from "@/shared/lib/url-state";
import { useCityStore } from "@/shared/store";
import { Button } from "@/shared/ui";

// Сколько клиник показывает блок — столько же, сколько раньше (первая
// страница API по умолчанию), но теперь уже отфильтрованных бэком.
const VISIBLE_COUNT = 20;

const ClinicsListContent = () => {
  // См. комментарий в doctorsMainList: адрес меняет FilterBar нативным
  // replaceState, и реагировать на это умеет только useUrlSearchParams.
  const searchParams = useUrlSearchParams();
  // Избранное клиник: без этого сердечко на главной не закрашивалось
  // и клик по нему ничего не сохранял (на /clinics подключено давно).
  const { isSaved, isPending, toggle } = useFavoriteToggle("clinic");

  const currentRating = searchParams.get("clinic_rating");
  const currentSpec = searchParams.get("clinic_spec");

  // Как у врачей на Главной (doctorsMainList): город, оценка и специализация
  // уходят в API. Раньше блок брал первые 20 клиник города, определённого по
  // IP, и фильтровал их на клиенте только по основным специализациям — узкие
  // специализации клиник из выпадающего списка ничего не находили.
  const selectedCity = useCityStore((s) => s.city);
  const filters: ClinicFilters = {
    city: selectedCity || undefined,
    specialization: currentSpec || undefined,
    min_rating:
      currentRating && currentRating !== "all"
        ? parseFloat(currentRating)
        : undefined,
    page_size: VISIBLE_COUNT,
  };

  const { data: filteredClinics = [], isLoading } = useQuery({
    queryKey: clinicKeys.list(filters),
    queryFn: () => api.getClinics(filters),
  });

  // Если данные грузятся, показываем наши новые красивые скелетоны
  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 lg:mt-10">
        <div className="md:hidden">
          <ClinicSkeleton count={3} variant="horizontal" />
        </div>
        <div className="hidden md:block">
          <ClinicSkeleton count={4} variant="vertical" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 lg:mt-10">
      <div className="flex flex-col gap-2 md:hidden">
        {filteredClinics.length === 0 && (
          <p className="text-center text-muted py-10">Клиники не найдены</p>
        )}
        {filteredClinics.map((clinic) => (
          <ClinicCard
            key={`mobile-${clinic.id}`}
            id={clinic.id}
            name={clinic.name}
            rating={clinic.rating}
            reviews={clinic.reviews}
            experience={clinic.experience}
            address={clinic.address}
            image={clinic.image}
            isSaved={isSaved(Number(clinic.id))}
            isPending={isPending(Number(clinic.id))}
            onSave={() => toggle(Number(clinic.id))}
            variant="horizontal"
          />
        ))}
      </div>

      {/* ДОБАВИЛ items-stretch ДЛЯ ВЫРАВНИВАНИЯ */}
      <div className="hidden md:grid md:grid-cols-4 gap-3 items-stretch">
        {filteredClinics.length === 0 && (
          <p className="col-span-4 text-center text-muted py-20 text-lg">
            По вашим параметрам клиники не найдены
          </p>
        )}
        {filteredClinics.map((clinic) => (
          <ClinicCard
            key={`desktop-${clinic.id}`}
            id={clinic.id}
            name={clinic.name}
            rating={clinic.rating}
            reviews={clinic.reviews}
            experience={clinic.experience}
            address={clinic.address}
            image={clinic.image}
            isSaved={isSaved(Number(clinic.id))}
            isPending={isPending(Number(clinic.id))}
            onSave={() => toggle(Number(clinic.id))}
            variant="vertical"
          />
        ))}
      </div>
    </div>
  );
};

export const ClinicsMainList: FC = () => {
  return (
    <div className="max-w-340 mx-auto pt-8 md:pt-0 pb-0 md:pb-30 px-4">
      <div className="hidden lg:block">
        <Suspense
          fallback={
            <div className="flex items-center justify-between">
              <div className="h-9 w-32 skeleton rounded-xl" />
              <div className="flex gap-2">
                {Array.from({ length: 3 }, (_, i) => (
                  <div key={i} className="h-9 w-28 skeleton rounded-full" />
                ))}
              </div>
            </div>
          }
        >
          <FilterBar
            title="Клиники"
            prefix="clinic"
            specializationScope="clinic"
            fields={{
              specialty: true,
              experience: false,
              rating: true,
              price: false,
            }}
          />
        </Suspense>
      </div>

      <div className="flex items-center justify-between lg:hidden">
        <h2 className="text-[18px] font-medium text-foreground">Клиники</h2>
        {/* prefetch — см. комментарий у ссылки на каталог в hero.tsx. */}
        <Link href="/clinics" prefetch>
          <Button
            variant="text"
            size="md"
            className="text-[#FF7C63] font-medium"
          >
            Все
          </Button>
        </Link>
      </div>

      <Suspense
        fallback={
          <div className="mt-10">
            <ClinicSkeleton count={4} variant="vertical" />
          </div>
        }
      >
        <ClinicsListContent />
      </Suspense>
    </div>
  );
};
