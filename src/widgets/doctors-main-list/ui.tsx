import { FC } from "react";

import { DoctorCard } from "@/entities";
import { FilterBar } from "@/features";
import { Button } from "@/shared";

import { DoctorImage1, DoctorImage2, DoctorImage3 } from "@/shared/assets";

export const DoctorsMainList: FC = () => {
  return (
    <div className="max-w-340 mx-auto py-30">
      <div className="hidden lg:block">
        <FilterBar />
      </div>
      <div className="flex items-center justify-between lg:hidden">
        <h2 className="text-[18px] font-medium text-[#191A1B]">Специалисты</h2>
        <Button variant="text" size="md" className="text-[#FF7C63] font-medium">
          Все
        </Button>
      </div>
      <div className="flex flex-col gap-3 lg:mt-10">
        {/* Мобильный: вертикальный список */}
        <div className="flex flex-col gap-2 md:hidden">
          <DoctorCard
            name="Айбеков Н. Э."
            specialty="Врач-терапевт"
            clinic="Nova Clinic"
            rating={4.85}
            reviews={255}
            experience={12}
            image={DoctorImage1}
            variant="horizontal"
          />
          <DoctorCard
            name="Иванова Мария Сергеевна"
            specialty="Врач-терапевт"
            clinic="Nova Clinic"
            rating={4.85}
            reviews={255}
            experience={12}
            image={DoctorImage2}
            variant="horizontal"
          />
          <DoctorCard
            name="Джумабеков Д. Р."
            specialty="Врач-терапевт"
            clinic="Nova Clinic"
            rating={4.85}
            reviews={255}
            experience={12}
            image={DoctorImage3}
            variant="horizontal"
          />
        </div>

        {/* Десктоп: грид 4 колонки */}
        <div className="hidden md:grid md:grid-cols-4 gap-3">
          <DoctorCard
            name="Айбеков Нурлан Эльдарович"
            specialty="Врач-терапевт"
            clinic="Nova Clinic"
            rating={4.85}
            reviews={255}
            experience={12}
            image={DoctorImage1}
          />
          <DoctorCard
            name="Иванова Мария Сергеевна"
            specialty="Кардиолог"
            clinic="MedCity"
            rating={4.72}
            reviews={130}
            experience={8}
            image={DoctorImage2}
          />
          <DoctorCard
            name="Очень Длинное Имя Врача Которое Не Помещается"
            specialty="Невролог"
            clinic="HealthPlus"
            rating={4.9}
            reviews={87}
            experience={15}
          />
          <DoctorCard
            name="Джумабеков Адилет"
            specialty="Хирург"
            clinic="BioMed"
            rating={4.6}
            reviews={210}
            experience={20}
            image={DoctorImage3}
            initialSaved
          />
        </div>
      </div>
    </div>
  );
};
