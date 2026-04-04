import { FC } from "react";

import { IconBtn } from "@/shared";

import { SearchHistory, SearchRemoveHistory } from "@/shared/assets";

const RECENT_SEARCHES = [
  "Первичная медико-санитарная помощь",
  "Врач по зубам",
  "Жалобы на боль",
  "Врачи-специалисты по глазам",
  "Доктор Айбеков Н. Э",
];

export const RecentSearches: FC = () => {
  return (
    <div className="bg-white p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[#191A1B] text-lg font-medium">Недавно искали</h2>
        <button className="text-[#F5653E] text-base active:scale-95 transition-transform">
          Удалить все
        </button>
      </div>

      <ul className="flex flex-col gap-4">
        {RECENT_SEARCHES.map((item, index) => (
          <li key={index} className="flex items-center justify-between group">
            <div className="flex items-center gap-3">
              <SearchHistory className="size-5 text-[#838A8D]" />
              <span className="text-[#191A1B] text-base">{item}</span>
            </div>

            <IconBtn variant="outline">
              <SearchRemoveHistory className="size-3" />
            </IconBtn>
          </li>
        ))}
      </ul>
    </div>
  );
};
