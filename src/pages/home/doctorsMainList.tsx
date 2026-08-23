"use client";

import { FC, Suspense } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useQuery } from "@tanstack/react-query";

import { useFavoriteToggle } from "@/features/favorite-toggle";
import { FilterBar } from "@/features/filter-bar";

import { DoctorCard, DoctorSkeleton } from "@/entities/doctor";

import { DoctorFilters, api, doctorKeys } from "@/shared/api";
import { ROUTES } from "@/shared/config";
import { useUrlSearchParams } from "@/shared/lib/url-state";
import { useCityStore } from "@/shared/store";
import { Button } from "@/shared/ui";

// Карусель на Главной раньше грузила только дефолтную (небольшую) страницу
// врачей и фильтровала её целиком на клиенте — из-за этого фильтры FilterBar
// могли молча не находить реальные совпадения, если они были за пределами
// первой страницы. Теперь город/онлайн/оценка/цена/стаж/специализация (в т.ч.
// несколько через запятую) уходят в API реальными параметрами — как на
// /specialists, поэтому достаточно запросить ровно то, что показываем.
const VISIBLE_COUNT = 8;

const DoctorsListContent = () => {
  const router = useRouter();
  // Избранное было подключено только на /specialists — на главной сердечко
  // рисовалось в состоянии «не сохранено» и клик ни к чему не вёл.
  const { isSaved, toggle } = useFavoriteToggle("doctor");
  // Именно useUrlSearchParams, а не useSearchParams из next/navigation:
  // FilterBar меняет адрес нативным history.replaceState (чтобы не гонять
  // серверную навигацию на каждый чих) и оповещает подписчиков своим
  // событием. Хук Next про такое обновление не узнаёт — из-за этого на
  // Главной фильтры переписывали URL, но список оставался прежним.
  const searchParams = useUrlSearchParams();

  const currentSpec = searchParams.get("doc_spec");
  const currentRating = searchParams.get("doc_rating");
  const currentExp = searchParams.get("doc_exp");
  const currentPrice = searchParams.get("doc_price");

  // Раньше карусель на Главной игнорировала выбранный город (в отличие от
  // /specialists, где город уже учитывался) — теперь оба списка врачей
  // ведут себя одинаково.
  const selectedCity = useCityStore((s) => s.city);

  const [priceMin, priceMax] = currentPrice
    ? currentPrice.split("-").map(Number)
    : [undefined, undefined];
  const [expMin, expMax] = currentExp
    ? currentExp.split("-").map(Number)
    : [undefined, undefined];
  const selectedSpecs = currentSpec
    ? currentSpec.split(",").filter(Boolean)
    : [];

  const filters: DoctorFilters = {
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
    page_size: VISIBLE_COUNT,
  };

  const { data: doctors = [], isLoading } = useQuery({
    queryKey: doctorKeys.list(filters),
    queryFn: () => api.getDoctors(filters),
  });

  if (isLoading) {
    return (
      // Обертка теперь точно такая же, как у реального контента (lg:mt-10)
      <div className="flex flex-col gap-3 lg:mt-10">
        <div className="md:hidden">
          <DoctorSkeleton count={3} variant="horizontal" />
        </div>
        <div className="hidden md:block">
          <DoctorSkeleton count={4} variant="vertical" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 lg:mt-10">
        {/* Мобильный вид */}
        <div className="flex flex-col gap-2 md:hidden">
          {doctors.length === 0 && (
            <p className="text-center text-muted py-10">Врачи не найдены</p>
          )}
          {doctors.map((doc) => (
            <DoctorCard
              key={`mobile-doc-${doc.id}`}
              {...doc}
              isSaved={isSaved(Number(doc.id))}
              onSave={() => toggle(Number(doc.id))}
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

        {/* Десктоп вид */}
        <div className="hidden md:grid md:grid-cols-4 gap-3 items-stretch">
          {doctors.length === 0 && (
            <p className="col-span-4 text-center text-muted py-20 text-lg">
              По вашим параметрам врачи не найдены
            </p>
          )}
          {doctors.map((doc) => (
            <DoctorCard
              key={`desktop-doc-${doc.id}`}
              {...doc}
              isSaved={isSaved(Number(doc.id))}
              onSave={() => toggle(Number(doc.id))}
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
      </div>
    </>
  );
};

export const DoctorsMainList: FC = () => {
  return (
    <div className="max-w-340 mx-auto pt-8 pb-0 md:py-30 px-4">
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
          <FilterBar
            prefix="doc"
            title="Специалисты"
            fields={{
              specialty: true,
              experience: true,
              rating: true,
              price: true,
            }}
          />
        </Suspense>
      </div>

      <div className="flex items-center justify-between lg:hidden">
        <h2 className="text-[18px] font-medium text-foreground">Специалисты</h2>
        <Link href="/specialists">
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
            <DoctorSkeleton count={4} variant="vertical" />
          </div>
        }
      >
        <DoctorsListContent />
      </Suspense>
    </div>
  );
};
