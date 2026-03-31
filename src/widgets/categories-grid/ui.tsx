import { FC } from "react";

import { CategoryCard } from "@/entities/category/ui";

const CATEGORIES = [
  "Кардиология",
  "Нефрология",
  "Пульмонология",
  "Гастроэнтерология",
  "Офтальмология",
  "Неврология",
  "Стоматология",
  "Дерматология",
];

export const CategoriesGrid: FC = () => {
  return (
    <div className="p-4 bg-white">
      <h2 className="text-[#191A1B] text-lg font-medium mb-3">Категории</h2>
      <div className="grid grid-cols-2 gap-x-3.5 gap-y-3 text-[#191A1B] font-medium">
        {CATEGORIES.map((cat) => (
          <CategoryCard key={cat} title={cat} />
        ))}
      </div>
    </div>
  );
};
