"use client";

import { FC, useState } from "react";

import { ConfirmDialog } from "@/shared";

import { SpecialistCard } from "@/entities/clinic-specialist";
import type { Specialist } from "@/entities/clinic-specialist";

import { SearchIcon } from "@/shared/assets";

const TrashIcon = () => (
  <svg
    width="28"
    height="28"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#F5653E"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
  </svg>
);

type Props = {
  specialists: Specialist[];
  onDelete: (id: string) => void;
};

export const SpecialistsList: FC<Props> = ({ specialists, onDelete }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const filteredItems = specialists.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const pendingName =
    specialists.find((s) => s.id === pendingDeleteId)?.name ?? "";

  return (
    <div>
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
        <button className="w-12 h-12 rounded-full bg-white border border-[#E5E6E8] flex items-center justify-center hover:bg-[#F8F9FA] transition-colors shrink-0">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M2.5 5.83333H17.5M5.83333 10H14.1667M8.33333 14.1667H11.6667"
              stroke="#686F72"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-[#E5E6E8]">
          <p className="text-[#838A8D] text-lg">
            {searchQuery ? "Специалисты не найдены" : "Специалистов пока нет"}
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
        icon={<TrashIcon />}
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
