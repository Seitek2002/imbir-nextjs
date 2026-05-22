import { FC } from "react";

import { CategoryCard } from "@/entities/category/ui";

import { ROUTES } from "@/shared/config/routes";
import { SPECIALIZATIONS } from "@/shared/config/specializations";

type Props = {
  onItemClick?: () => void;
};

export const CategoriesGrid: FC<Props> = ({ onItemClick }) => {
  return (
    <div className="p-4 bg-white">
      <h2 className="text-[#191A1B] text-lg font-medium mb-3">Категории</h2>
      <div className="grid grid-cols-2 gap-x-3.5 gap-y-3 text-[#191A1B] font-medium">
        {SPECIALIZATIONS.map((cat) => (
          <CategoryCard
            key={cat.name}
            title={cat.name}
            image={cat.image}
            href={`${ROUTES.SPECIALISTS}?doc_spec=${encodeURIComponent(cat.name)}`}
            onClick={onItemClick}
          />
        ))}
      </div>
    </div>
  );
};
