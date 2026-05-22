"use client";

import { FC, useState } from "react";

import { IconBtn, SearchInput } from "@/shared";

import { ProcedureCard } from "@/entities/clinic-procedure";
import type { Procedure } from "@/entities/clinic-procedure";

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
        <div className="flex-1">
          <SearchInput value={searchQuery} onChange={setSearchQuery} />
        </div>
        <IconBtn variant="outline" className="w-12 h-12 shrink-0">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M2.5 5.83333H17.5M5.83333 10H14.1667M8.33333 14.1667H11.6667"
              stroke="#686F72"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </IconBtn>
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
