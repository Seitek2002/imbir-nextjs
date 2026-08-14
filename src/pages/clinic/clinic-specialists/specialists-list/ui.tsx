"use client";

import { FC, useEffect, useRef, useState } from "react";

import { TrashIcon } from "@/shared/assets/icons";
import { colors } from "@/shared/config";
import { ConfirmDialog, FilterPanel, IconBtn, SearchInput } from "@/shared/ui";

import {
  type Specialist,
  SpecialistCard,
  SpecialistRow,
} from "./SpecialistCard";

type Props = {
  specialists: Specialist[];
  // Реальный DELETE-запрос выполняется у родителя (ClinicSpecialistsPage) —
  // здесь ждём его промис, чтобы показать спиннер в ConfirmDialog и закрыть
  // диалог только после ответа сервера.
  onDelete: (id: string) => Promise<void>;
};

export const SpecialistsList: FC<Props> = ({ specialists, onDelete }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(
    null,
  );

  const filterBtnRef = useRef<HTMLButtonElement>(null);
  const filterPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filterOpen) return;
    const close = (e: MouseEvent) => {
      if (filterBtnRef.current?.contains(e.target as Node)) return;
      if (filterPanelRef.current?.contains(e.target as Node)) return;
      setFilterOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [filterOpen]);

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
          ref={filterBtnRef}
          variant="outline"
          className={`w-12 h-12 shrink-0 ${filterOpen || selectedSpecialty ? "border-primary" : ""}`}
          onClick={() => setFilterOpen((v) => !v)}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M2.5 5.83333H17.5M5.83333 10H14.1667M8.33333 14.1667H11.6667"
              stroke={
                filterOpen || selectedSpecialty
                  ? colors.primary
                  : colors.secondary
              }
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </IconBtn>
      </div>

      {/* Filter panel */}
      {filterOpen && (
        <div ref={filterPanelRef}>
          <FilterPanel
            label="Специализация"
            options={specialties}
            selected={selectedSpecialty}
            onSelect={setSelectedSpecialty}
          />
        </div>
      )}

      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-border">
          <p className="text-muted text-lg">
            {searchQuery || selectedSpecialty
              ? "Специалисты не найдены"
              : "Специалистов пока нет"}
          </p>
        </div>
      ) : (
        <>
          {/* Десктоп: сетка карточек */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((specialist) => (
              <SpecialistCard
                key={specialist.id}
                {...specialist}
                onDelete={(id) => setPendingDeleteId(id)}
              />
            ))}
          </div>

          {/* Мобайл: компактный список строк */}
          <div className="md:hidden flex flex-col gap-3">
            {filteredItems.map((specialist) => (
              <SpecialistRow
                key={specialist.id}
                {...specialist}
                onDelete={(id) => setPendingDeleteId(id)}
              />
            ))}
          </div>
        </>
      )}

      <ConfirmDialog
        isOpen={pendingDeleteId !== null}
        onClose={() => setPendingDeleteId(null)}
        onConfirm={async () => {
          if (!pendingDeleteId) return;
          setIsDeleting(true);
          try {
            await onDelete(pendingDeleteId);
            setPendingDeleteId(null);
          } catch {
            // Ошибка уже показана тостом в onError мутации у родителя —
            // оставляем диалог открытым, чтобы можно было повторить попытку.
          } finally {
            setIsDeleting(false);
          }
        }}
        icon={<TrashIcon className="w-7 h-7" />}
        variant="danger"
        title="Удалить специалиста?"
        description={
          pendingName
            ? `«${pendingName}» будет удалён без возможности восстановления`
            : "Специалист будет удалён без возможности восстановления"
        }
        confirmLabel="Удалить"
        cancelLabel="Отмена"
        isLoading={isDeleting}
        closeOnConfirm={false}
      />
    </div>
  );
};
