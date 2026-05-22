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
import { ROUTES } from "@/shared/config/routes";

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

type Props = {
  onItemClick?: () => void;
};

export const CategoriesGrid: FC<Props> = ({ onItemClick }) => {
  return (
    <div className="p-4 bg-white">
      <h2 className="text-[#191A1B] text-lg font-medium mb-3">Категории</h2>
      <div className="grid grid-cols-2 gap-x-3.5 gap-y-3 text-[#191A1B] font-medium">
        {CATEGORIES.map((cat) => (
          <CategoryCard
            key={cat.title}
            title={cat.title}
            image={cat.image}
            href={`${ROUTES.SPECIALISTS}?doc_spec=${encodeURIComponent(cat.title)}`}
            onClick={onItemClick}
          />
        ))}
      </div>
    </div>
  );
};
