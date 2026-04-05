import { FC } from "react";

import { DoctorCard } from "@/entities";
import { FilterBar } from "@/features";
import { Button } from "@/shared";

import {
  DoctorImage1,
  DoctorImage2,
  DoctorImage3,
  DoctorImage4,
  DoctorImage5,
  DoctorImage6,
  DoctorImage7,
  DoctorImage8,
} from "@/shared/assets";

export const DoctorsMainList: FC = () => {
  return (
    <div className="max-w-340 mx-auto py-30 px-4">
      <div className="hidden lg:block">
        <FilterBar title="Специалисты" />
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

        {/* Десктоп: грид 4 колонки, 2 ряда */}
        <div className="hidden md:grid md:grid-cols-4 gap-3 items-stretch">
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
          <DoctorCard
            name="Садыкова Айгуль Турдукановна"
            specialty="Педиатр"
            clinic="MedCity"
            rating={4.95}
            reviews={312}
            experience={10}
            image={DoctorImage4}
          />
          <DoctorCard
            name="Токтосунов Мирлан"
            specialty="Хирург"
            clinic="Nova Clinic"
            rating={4.8}
            reviews={98}
            experience={18}
            image={DoctorImage5}
          />
          <DoctorCard
            name="Эрматова Зульфия"
            specialty="Офтальмолог"
            clinic="BioMed"
            rating={4.7}
            reviews={145}
            experience={9}
            image={DoctorImage6}
          />
          <DoctorCard
            name="Асанов Бакыт Кемелович"
            specialty="Кардиолог"
            clinic="HealthPlus"
            rating={4.88}
            reviews={203}
            experience={22}
            image={DoctorImage7}
          />
        </div>
      </div>
    </div>
  );
};
