"use client";

import { FC, Suspense } from "react";

import { useSearchParams } from "next/navigation";

import { DoctorCard } from "@/entities";
import { FilterBar } from "@/features";

import { DoctorSkeleton } from "@/entities/doctor";

import { MOCK_SPECIALISTS } from "@/shared/constants/mocks";
import { Button } from "@/shared/ui";

const DoctorsListContent = () => {
  const searchParams = useSearchParams();

  const currentSpec = searchParams.get("doc_spec");
  const currentRating = searchParams.get("doc_rating");
  const currentExp = searchParams.get("doc_exp");
  const currentPrice = searchParams.get("doc_price");
  const isOnlineOnly = searchParams.get("doc_online") === "true"; // <-- НОВОЕ

  const filteredDoctors = MOCK_SPECIALISTS.filter((doc) => {
    // <-- НОВОЕ: Фильтр онлайна
    if (isOnlineOnly && !doc.isOnlineAvailable) return false;

    // 1. Специальность
    if (currentSpec) {
      const selectedSpecs = currentSpec.split(",");
      if (!selectedSpecs.includes(doc.specialty)) return false;
    }

    // 2. Рейтинг
    if (currentRating && currentRating !== "all") {
      const minRating = parseFloat(currentRating);
      if (doc.rating < minRating) return false;
    }

    // 3. Опыт (стаж)
    if (currentExp) {
      const [minExp, maxExp] = currentExp.split("-").map(Number);
      if (doc.experience < minExp || doc.experience > maxExp) return false;
    }

    // 4. Цена (Ищем минимальную по всем клиникам)
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

  return (
    <>
      <div className="flex flex-col gap-3 lg:mt-10">
        {/* Мобильный вид */}
        <div className="flex flex-col gap-2 md:hidden">
          {filteredDoctors.length === 0 && (
            <p className="text-center text-[#838A8D] py-10">Врачи не найдены</p>
          )}
          {filteredDoctors.map((doc) => (
            <DoctorCard
              key={`mobile-doc-${doc.id}`}
              {...doc} // <-- ИСПРАВЛЕНО
              variant="horizontal"
            />
          ))}
        </div>

        {/* Десктоп вид */}
        <div className="hidden md:grid md:grid-cols-4 gap-3 items-stretch">
          {filteredDoctors.length === 0 && (
            <p className="col-span-4 text-center text-[#838A8D] py-20 text-lg">
              По вашим параметрам врачи не найдены
            </p>
          )}
          {filteredDoctors.map((doc) => (
            <DoctorCard
              key={`desktop-doc-${doc.id}`}
              {...doc} // <-- ИСПРАВЛЕНО
              variant="vertical"
            />
          ))}
        </div>
      </div>
    </>
  );
};

export const DoctorsMainList: FC = () => {
  return (
    <div className="max-w-340 mx-auto py-30 px-4">
      <div className="hidden lg:block">
        <Suspense
          fallback={
            <div className="flex items-center justify-between">
              <div className="h-9 w-44 skeleton rounded-xl" />
              <div className="flex gap-2">
                {Array.from({ length: 4 }, (_, i) => (
                  <div key={i} className="h-9 w-28 skeleton rounded-full" />
                ))}
              </div>
            </div>
          }
        >
          {/* Передаем online: true чтобы появился чекбокс */}
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
        </Suspense>
      </div>

      <div className="flex items-center justify-between lg:hidden">
        <h2 className="text-[18px] font-medium text-[#191A1B]">Специалисты</h2>
        <Button variant="text" size="md" className="text-[#FF7C63] font-medium">
          Все
        </Button>
      </div>

      <Suspense
        fallback={
          <div className="mt-10">
            <DoctorSkeleton count={4} variant="vertical" />
          </div>
        }
      >
        <DoctorsListContent />
      </Suspense>
    </div>
  );
};
