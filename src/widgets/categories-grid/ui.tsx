import { FC } from "react";

import { CategoryCard } from "@/entities/category/ui";

import {
  ServiceCardiology,
  ServiceDentistry,
  ServiceGastroenterology,
  ServiceGinecology,
  ServiceLor,
  ServiceNevrology,
  ServiceOphthalmology,
  ServicePulmonology,
} from "@/shared/assets";

const CATEGORIES = [
  { title: "Кардиология", image: ServiceCardiology },
  { title: "Неврология", image: ServiceNevrology },
  { title: "Пульмонология", image: ServicePulmonology },
  { title: "Гастроэнтерология", image: ServiceGastroenterology },
  { title: "Офтальмология", image: ServiceOphthalmology },
  { title: "Стоматология", image: ServiceDentistry },
  { title: "Гинекология", image: ServiceGinecology },
  { title: "ЛОР", image: ServiceLor },
];

export const CategoriesGrid: FC = () => {
  return (
    <div className="p-4 bg-white">
      <h2 className="text-[#191A1B] text-lg font-medium mb-3">Категории</h2>
      <div className="grid grid-cols-2 gap-x-3.5 gap-y-3 text-[#191A1B] font-medium">
        {CATEGORIES.map((cat) => (
          <CategoryCard
            key={cat.title}
            title={cat.title}
            image={cat.image} // Передаем картинку пропсом в карточку
          />
        ))}
      </div>
    </div>
  );
};
