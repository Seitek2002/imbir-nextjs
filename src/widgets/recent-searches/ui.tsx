import { FC } from "react";

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
        {/* Позже эту кнопку можно вынести в отдельную фичу */}
        <button className="text-[#F5653E] text-base active:scale-95 transition-transform">
          Удалить все
        </button>
      </div>
      <ul className="flex flex-col gap-4">
        {RECENT_SEARCHES.map((item, index) => (
          <li key={index} className="text-[#191A1B]">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};
