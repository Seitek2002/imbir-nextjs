import { FC } from "react";

import Link from "next/link";

// ИМПОРТИРУЕМ ФИЧИ И ВИДЖЕТЫ
import {
  ActiveFiltersChips,
  FiltersTrigger,
  MobileFiltersModal,
} from "@/features";
import { Footer, Header } from "@/widgets";

import { FilterBar } from "@/features/filter-bar/ui";
import { UrlSearchInput } from "@/features/search-by-query/ui";

import { ClinicCard } from "@/entities/clinic";

// Импортируем карточку клиники

import {
  ClinicImage1,
  ClinicImage2,
  ClinicImage3,
  ClinicImage4,
} from "@/shared/assets";
import { Button } from "@/shared/ui";

// Моковые данные (продублировал, чтобы была полноценная сетка из 8 элементов)
const MOCK_CLINICS = [
  {
    id: "1",
    name: "Nova Clinic",
    rating: 4.85,
    reviews: 255,
    experience: 12,
    address: "ул. Московская, 189",
    image: ClinicImage1.src,
  },
  {
    id: "2",
    name: "K-MED",
    rating: 4.85,
    reviews: 255,
    experience: 12,
    address: "ул. Московская, 189",
    image: ClinicImage2.src,
  },
  {
    id: "3",
    name: "Med Center",
    rating: 4.85,
    reviews: 255,
    experience: 12,
    address: "ул. Московская, 189",
    image: ClinicImage3.src,
  },
  {
    id: "4",
    name: "Nova Clinic",
    rating: 4.85,
    reviews: 255,
    experience: 12,
    address: "ул. Московская, 189",
    image: ClinicImage4.src,
  },
  {
    id: "5",
    name: "Nova Clinic",
    rating: 4.85,
    reviews: 255,
    experience: 12,
    address: "ул. Московская, 189",
    image: ClinicImage1.src,
  },
  {
    id: "6",
    name: "K-MED",
    rating: 4.85,
    reviews: 255,
    experience: 12,
    address: "ул. Московская, 189",
    image: ClinicImage2.src,
  },
  {
    id: "7",
    name: "Med Center",
    rating: 4.85,
    reviews: 255,
    experience: 12,
    address: "ул. Московская, 189",
    image: ClinicImage3.src,
  },
  {
    id: "8",
    name: "Nova Clinic",
    rating: 4.85,
    reviews: 255,
    experience: 12,
    address: "ул. Московская, 189",
    image: ClinicImage4.src,
  },
];

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export const ClinicsPage: FC<Props> = ({ searchParams }) => {
  const activeQuery = typeof searchParams?.q === "string" ? searchParams.q : "";
  const isFiltersModalOpen = searchParams?.modal === "filters";

  // Конфигурация доступных фильтров для этой страницы
  const clinicFilters = {
    specialty: true,
    experience: false, // Отключаем стаж
    rating: true,
    price: false, // Отключаем стоимость
  };

  return (
    <main className="min-h-screen bg-[#F2F3F5] md:bg-white flex flex-col">
      {/* HEADER */}
      <Header title="Клиники" backTo="/">
        <div className="flex gap-3 items-center mt-3 md:mt-0 md:block">
          <div className="flex-1">
            <UrlSearchInput placeholder="Поиск клиники" />
          </div>
          <div className="md:hidden">
            <FiltersTrigger />
          </div>
        </div>
        <ActiveFiltersChips />
      </Header>

      {/* МОДАЛКА ФИЛЬТРОВ (только специализация и рейтинг) */}
      <MobileFiltersModal isOpen={isFiltersModalOpen} fields={clinicFilters} />

      <div className="flex-1 w-full max-w-360 mx-auto pb-10">
        {/* --- МОБИЛЬНАЯ ВЕРСИЯ КАТАЛОГА --- */}
        <div className="md:hidden p-4">
          {activeQuery && (
            <h2 className="text-[#191A1B] text-lg font-medium mb-4">
              Результаты по запросу: {activeQuery}
            </h2>
          )}

          <div className="flex flex-col gap-2">
            {MOCK_CLINICS.map((clinic) => (
              <ClinicCard
                key={`mob-${clinic.id}`}
                name={clinic.name}
                rating={clinic.rating}
                reviews={clinic.reviews}
                experience={clinic.experience}
                address={clinic.address}
                image={clinic.image}
              />
            ))}
          </div>
          <Button
            variant="outline"
            className="w-full mt-6 bg-white justify-center"
          >
            Показать еще
          </Button>
        </div>

        {/* --- ДЕСКТОПНАЯ ВЕРСИЯ КАТАЛОГА --- */}
        <div className="hidden md:block px-10 py-6">
          {/* Хлебные крошки */}
          <div className="text-sm text-[#686F72] mb-6 flex items-center gap-2">
            <Link href="/" className="hover:text-[#F5653E] transition-colors">
              Главная
            </Link>
            <span>•</span>
            <span className={activeQuery ? "" : "text-[#F5653E]"}>
              {activeQuery ? (
                <Link
                  href="/clinics"
                  className="hover:text-[#F5653E] transition-colors"
                >
                  Клиники
                </Link>
              ) : (
                "Клиники"
              )}
            </span>
            {activeQuery && (
              <>
                <span>•</span>
                <span className="text-[#F5653E]">
                  По запросу «{activeQuery}»
                </span>
              </>
            )}
          </div>

          {/* FILTER BAR (только специализация и рейтинг) */}
          <FilterBar title="Клиники" fields={clinicFilters} />

          {/* Сетка результатов */}
          <div className="grid grid-cols-4 gap-5 mt-2">
            {MOCK_CLINICS.map((clinic) => (
              <ClinicCard
                key={`desk-${clinic.id}`}
                name={clinic.name}
                rating={clinic.rating}
                reviews={clinic.reviews}
                experience={clinic.experience}
                address={clinic.address}
                image={clinic.image}
              />
            ))}
          </div>

          {/* Кнопка Показать еще */}
          <div className="flex justify-center mt-10">
            <Button variant="outline" className="bg-white">
              Показать еще
            </Button>
          </div>
        </div>
      </div>

      <div className="hidden md:block mt-auto">
        <Footer />
      </div>
    </main>
  );
};
