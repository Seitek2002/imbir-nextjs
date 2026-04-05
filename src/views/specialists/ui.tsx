import { FC } from "react";

import Link from "next/link";

import {
  ActiveFiltersChips,
  FiltersTrigger,
  MobileFiltersModal,
} from "@/features";
import { Footer, Header } from "@/widgets";

import { FilterBar } from "@/features/filter-bar/ui";
import { UrlSearchInput } from "@/features/search-by-query/ui";

import { DoctorCard } from "@/entities/doctor";

import { DoctorImage1, DoctorImage2, DoctorImage3 } from "@/shared/assets";
import { Button } from "@/shared/ui";

const MOCK_DOCTORS = [
  {
    id: 1,
    name: "Айбеков Нурлан Эльдарович",
    specialty: "Врач-терапевт",
    clinic: "Nova Clinic",
    rating: 4.85,
    reviews: 255,
    experience: 12,
    image: DoctorImage1,
  },
  {
    id: 2,
    name: "Садыкова Алина Тимуровна",
    specialty: "Врач-терапевт",
    clinic: "Nova Clinic",
    rating: 4.85,
    reviews: 255,
    experience: 12,
    image: DoctorImage2,
  },
  {
    id: 3,
    name: "Жумабаев Данияр Русланович",
    specialty: "Врач-терапевт",
    clinic: "Nova Clinic",
    rating: 4.85,
    reviews: 255,
    experience: 12,
    image: DoctorImage3,
  },
  {
    id: 4,
    name: "Калиева Айгерим Бакытовна",
    specialty: "Врач-терапевт",
    clinic: "Nova Clinic",
    rating: 4.85,
    reviews: 255,
    experience: 12,
    image: DoctorImage1,
  },
  {
    id: 5,
    name: "Калиева Айгерим Бакытовна",
    specialty: "Врач-терапевт",
    clinic: "Nova Clinic",
    rating: 4.85,
    reviews: 255,
    experience: 12,
    image: DoctorImage1,
  },
  {
    id: 6,
    name: "Садыкова Алина Тимуровна",
    specialty: "Врач-терапевт",
    clinic: "Nova Clinic",
    rating: 4.85,
    reviews: 255,
    experience: 12,
    image: DoctorImage2,
  },
  {
    id: 7,
    name: "Айбеков Нурлан Эльдарович",
    specialty: "Врач-терапевт",
    clinic: "Nova Clinic",
    rating: 4.85,
    reviews: 255,
    experience: 12,
    image: DoctorImage3,
  },
  {
    id: 8,
    name: "Жумабаев Данияр Русланович",
    specialty: "Врач-терапевт",
    clinic: "Nova Clinic",
    rating: 4.85,
    reviews: 255,
    experience: 12,
    image: DoctorImage1,
  },
];

type Props = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export const SpecialistsPage: FC<Props> = ({ searchParams }) => {
  const activeQuery = typeof searchParams?.q === "string" ? searchParams.q : "";
  const isFiltersModalOpen = searchParams?.modal === "filters";

  return (
    <main className="min-h-screen bg-[#F2F3F5] md:bg-white flex flex-col">
      <Header title="Специалисты" backTo="/">
        <div className="flex gap-3 items-center mt-3 md:mt-0 md:block">
          <div className="flex-1">
            <UrlSearchInput placeholder="Поиск специалиста" />
          </div>
          <div className="md:hidden">
            <FiltersTrigger />
          </div>
        </div>
        <ActiveFiltersChips />
      </Header>

      <MobileFiltersModal
        isOpen={isFiltersModalOpen}
        fields={{
          specialty: true,
          experience: true,
          rating: true,
          price: true,
        }}
      />

      <div className="flex-1 w-full max-w-360 mx-auto pb-10">
        <div className="md:hidden p-4">
          {activeQuery && (
            <h2 className="text-[#191A1B] text-lg font-medium mb-4">
              Результаты по запросу: {activeQuery}
            </h2>
          )}

          <div className="flex flex-col gap-2">
            {MOCK_DOCTORS.map((doc) => (
              <DoctorCard key={`mob-${doc.id}`} {...doc} variant="horizontal" />
            ))}
          </div>
          <Button
            variant="outline"
            className="w-full mt-6 bg-white justify-center"
          >
            Показать еще
          </Button>
        </div>

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
                  href="/specialists"
                  className="hover:text-[#F5653E] transition-colors"
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
                <span className="text-[#F5653E]">
                  По запросу «{activeQuery}»
                </span>
              </>
            )}
          </div>

          <FilterBar title="Специалисты" />

          <div className="grid grid-cols-4 gap-5 mt-2">
            {MOCK_DOCTORS.map((doc) => (
              <DoctorCard key={`desk-${doc.id}`} {...doc} />
            ))}
          </div>

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
