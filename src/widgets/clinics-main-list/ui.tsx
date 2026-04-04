import { FC } from "react";

import { FilterBar } from "@/features";
import { Button } from "@/shared";

import { ClinicCard } from "@/entities/clinic";

import {
  ClinicImage1,
  ClinicImage2,
  ClinicImage3,
  ClinicImage4,
} from "@/shared/assets";

// Вынес моковые данные в константу для чистоты (позже заменишь на данные с бэка)
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
];

export const ClinicsMainList: FC = () => {
  return (
    <div className="max-w-340 mx-auto pb-30 px-4">
      <div className="hidden lg:block">
        <FilterBar
          title="Клиники"
          fields={{
            specialty: true,
            experience: false,
            rating: true,
            price: false,
          }}
        />
      </div>

      <div className="flex items-center justify-between lg:hidden">
        <h2 className="text-[18px] font-medium text-[#191A1B]">Клиники</h2>
        <Button variant="text" size="md" className="text-[#FF7C63] font-medium">
          Все
        </Button>
      </div>

      <div className="flex flex-col gap-3 lg:mt-10">
        {/* Мобильный: вертикальный список */}
        <div className="flex flex-col gap-2 md:hidden">
          {MOCK_CLINICS.map((clinic) => (
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
          {MOCK_CLINICS.map((clinic) => (
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
    </div>
  );
};
