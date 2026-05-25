"use client";

import { FC, useState } from "react";

import { ConfirmDialog, IconBtn, SearchInput } from "@/shared";

import { SpecialistCard } from "@/entities/clinic-specialist";
import type { Specialist } from "@/entities/clinic-specialist";

import { TrashIcon } from "@/shared/assets";

type Props = {
  specialists: Specialist[];
  onDelete: (id: string) => void;
};

export const SpecialistsList: FC<Props> = ({ specialists, onDelete }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(
    null,
  );

  const specialties = Array.from(new Set(specialists.map((s) => s.specialty)));

  const filteredItems = specialists.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesSpecialty =
      !selectedSpecialty || item.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const pendingName =
    specialists.find((s) => s.id === pendingDeleteId)?.name ?? "";

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1">
          <SearchInput value={searchQuery} onChange={setSearchQuery} />
        </div>
        <IconBtn
          variant="outline"
          className={`w-12 h-12 shrink-0 ${filterOpen || selectedSpecialty ? "border-[#F5653E]" : ""}`}
          onClick={() => setFilterOpen((v) => !v)}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M2.5 5.83333H17.5M5.83333 10H14.1667M8.33333 14.1667H11.6667"
              stroke={filterOpen || selectedSpecialty ? "#F5653E" : "#686F72"}
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
            <p className="text-sm font-medium text-[#191A1B]">Специализация</p>
            {selectedSpecialty && (
              <button
                onClick={() => setSelectedSpecialty(null)}
                className="text-xs text-[#F5653E] hover:underline"
              >
                Сбросить
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {specialties.map((spec) => (
              <button
                key={spec}
                onClick={() =>
                  setSelectedSpecialty(selectedSpecialty === spec ? null : spec)
                }
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  selectedSpecialty === spec
                    ? "bg-[#F5653E] text-white"
                    : "border border-[#E5E6E8] text-[#686F72] hover:border-[#F5653E] hover:text-[#F5653E]"
                }`}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>
      )}

      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-[#E5E6E8]">
          <p className="text-[#838A8D] text-lg">
            {searchQuery || selectedSpecialty
              ? "Специалисты не найдены"
              : "Специалистов пока нет"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((specialist) => (
            <SpecialistCard
              key={specialist.id}
              {...specialist}
              onDelete={(id) => setPendingDeleteId(id)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={pendingDeleteId !== null}
        onClose={() => setPendingDeleteId(null)}
        onConfirm={() => {
          if (pendingDeleteId) onDelete(pendingDeleteId);
          setPendingDeleteId(null);
        }}
        icon={<TrashIcon className="w-7 h-7 text-[#F5653E]" />}
        title="Удалить специалиста?"
        description={
          pendingName
            ? `«${pendingName}» будет удалён без возможности восстановления`
            : "Специалист будет удалён без возможности восстановления"
        }
        confirmLabel="Удалить"
        cancelLabel="Отмена"
      />
    </div>
  );
};
