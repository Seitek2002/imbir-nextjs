"use client";

import { FC, Suspense } from "react";

import { useSearchParams } from "next/navigation";

import { FilterBar } from "@/features";

import { ClinicCard } from "@/entities/clinic";
import { ClinicSkeleton } from "@/entities/clinic";

import { MOCK_CLINICS } from "@/shared/constants/mocks";
import { Button } from "@/shared/ui";

const ClinicsListContent = () => {
  const searchParams = useSearchParams();

  // Читаем параметры для клиник
  const currentRating = searchParams.get("clinic_rating");
  const currentSpec = searchParams.get("clinic_spec"); // <-- ДОБАВИЛИ ЧТЕНИЕ СПЕЦ.

  // Фильтруем данные клиник
  const filteredClinics = MOCK_CLINICS.filter((clinic) => {
    // 1. Проверка рейтинга
    if (currentRating && currentRating !== "all") {
      const minRating = parseFloat(currentRating);
      if (clinic.rating < minRating) return false;
    }

    // 2. Проверка специализации (НОВАЯ ЛОГИКА)
    if (currentSpec) {
      const selectedSpecs = currentSpec.split(",");
      // Проверяем, есть ли в клинике ХОТЯ БЫ ОДНА из выбранных специальностей
      const hasMatch = clinic.specialties.some((spec) =>
        selectedSpecs.includes(spec),
      );
      if (!hasMatch) return false;
    }

    return true; // Клиника прошла фильтры
  });

  return (
    <div className="flex flex-col gap-3 lg:mt-10">
      <div className="flex flex-col gap-2 md:hidden">
        {filteredClinics.length === 0 && (
          <p className="text-center text-[#838A8D] py-10">Клиники не найдены</p>
        )}
        {filteredClinics.map((clinic) => (
          <ClinicCard
            key={`mobile-${clinic.id}`}
            name={clinic.name}
            rating={clinic.rating}
            reviews={clinic.reviews}
            experience={clinic.experience}
            address={clinic.address}
            image={clinic.image}
          />
        ))}
      </div>

      <div className="hidden md:grid md:grid-cols-4 gap-3">
        {filteredClinics.length === 0 && (
          <p className="col-span-4 text-center text-[#838A8D] py-20 text-lg">
            По вашим параметрам клиники не найдены
          </p>
        )}
        {filteredClinics.map((clinic) => (
          <ClinicCard
            key={`desktop-${clinic.id}`}
            name={clinic.name}
            rating={clinic.rating}
            reviews={clinic.reviews}
            experience={clinic.experience}
            address={clinic.address}
            image={clinic.image}
          />
        ))}
      </div>
    </div>
  );
};

export const ClinicsMainList: FC = () => {
  return (
    <div className="max-w-340 mx-auto pb-30 px-4">
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
        <h2 className="text-[18px] font-medium text-[#191A1B]">Клиники</h2>
        <Button variant="text" size="md" className="text-[#FF7C63] font-medium">
          Все
        </Button>
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
