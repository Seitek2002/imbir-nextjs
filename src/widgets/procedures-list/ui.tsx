"use client";

import { FC, useState } from "react";

import { ProcedureCard } from "@/entities/clinic-procedure";
import type { Procedure } from "@/entities/clinic-procedure";

import { SearchIcon } from "@/shared/assets";

type Props = {
  procedures: Procedure[];
};

export const ProceduresList: FC<Props> = ({ procedures }) => {
  const [items, setItems] = useState(procedures);
  const [searchQuery, setSearchQuery] = useState("");

  const handleDelete = (id: string) => {
    if (confirm("Вы уверены, что хотите удалить процедуру?")) {
      setItems((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div>
      {/* Search + Filter */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Поиск"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 rounded-full bg-white border border-[#E5E6E8] text-[#191A1B] placeholder:text-[#C4C8CA] focus:outline-none focus:border-[#F5653E] transition-colors"
          />
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#838A8D] [&_path]:stroke-[#838A8D]" />
        </div>
        <button className="w-12 h-12 rounded-full bg-white border border-[#E5E6E8] flex items-center justify-center hover:bg-[#F8F9FA] transition-colors flex-shrink-0">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M2.5 5.83333H17.5M5.83333 10H14.1667M8.33333 14.1667H11.6667"
              stroke="#686F72"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-[#E5E6E8]">
          <p className="text-[#838A8D] text-lg">Процедуры не найдены</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((procedure) => (
            <ProcedureCard
              key={procedure.id}
              {...procedure}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};
