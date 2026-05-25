"use client";

import { FC, useState } from "react";

import { ConfirmDialog, IconBtn, SearchInput } from "@/shared";

import { ProcedureCard } from "@/entities/clinic-procedure";
import type { Procedure } from "@/entities/clinic-procedure";

type Props = {
  procedures: Procedure[];
};

export const ProceduresList: FC<Props> = ({ procedures }) => {
  const [items, setItems] = useState(procedures);
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleDelete = (id: string) => setPendingDeleteId(id);

  const categories = Array.from(new Set(items.map((i) => i.category)));

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      {/* Search + Filter */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1">
          <SearchInput value={searchQuery} onChange={setSearchQuery} />
        </div>
        <IconBtn
          variant="outline"
          className={`w-12 h-12 shrink-0 ${filterOpen || selectedCategory ? "border-[#F5653E] text-[#F5653E]" : ""}`}
          onClick={() => setFilterOpen((v) => !v)}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M2.5 5.83333H17.5M5.83333 10H14.1667M8.33333 14.1667H11.6667"
              stroke={filterOpen || selectedCategory ? "#F5653E" : "#686F72"}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </IconBtn>
      </div>

      {/* Filter panel */}
      {filterOpen && (
        <div className="bg-white rounded-2xl border border-[#E5E6E8] p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-[#191A1B]">Категория</p>
            {selectedCategory && (
              <button
                onClick={() => setSelectedCategory(null)}
                className="text-xs text-[#F5653E] hover:underline"
              >
                Сбросить
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() =>
                  setSelectedCategory(selectedCategory === cat ? null : cat)
                }
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  selectedCategory === cat
                    ? "bg-[#F5653E] text-white"
                    : "border border-[#E5E6E8] text-[#686F72] hover:border-[#F5653E] hover:text-[#F5653E]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

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
      <ConfirmDialog
        isOpen={pendingDeleteId !== null}
        onClose={() => setPendingDeleteId(null)}
        onConfirm={() => {
          setItems((prev) =>
            prev.filter((item) => item.id !== pendingDeleteId),
          );
          setPendingDeleteId(null);
        }}
        title="Удалить процедуру?"
        description="Это действие нельзя отменить"
        confirmLabel="Удалить"
        cancelLabel="Отмена"
      />
    </div>
  );
};
