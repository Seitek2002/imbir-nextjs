"use client";

import { FC, useEffect, useRef, useState } from "react";

import { colors } from "@/shared/config";
import { ConfirmDialog, FilterPanel, IconBtn, SearchInput } from "@/shared/ui";

import type { Procedure } from "./clinic-procedure/model";
import {
  ProcedureCard,
  ProcedureCardSkeleton,
  ProcedureRow,
  ProcedureRowSkeleton,
} from "./clinic-procedure/ui";

type Props = {
  // Список ещё не пришёл — отдельно от "procedures пуст", иначе на время
  // загрузки на секунду мигает "Процедур пока нет".
  isLoading?: boolean;
  // Реальное удаление уходит в сеть на уровне родителя — здесь просто ждём
  // промис, чтобы показать спиннер в ConfirmDialog и закрыть его по факту.
  onDelete?: (id: string) => Promise<void> | void;
  procedures: Procedure[];
};

export const ProceduresList: FC<Props> = ({
  procedures,
  isLoading = false,
  onDelete,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [pendingDeleteId, setPendingDeleteId] = useState<null | string>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<null | string>(null);

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

  const categories = Array.from(new Set(procedures.map((i) => i.category)));

  const filteredItems = procedures.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategory || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleDeleteConfirm = async () => {
    if (!pendingDeleteId) return;
    setIsDeleting(true);
    try {
      await onDelete?.(pendingDeleteId);
      setPendingDeleteId(null);
    } catch {
      // ошибка уже обработана в onError мутации (toast) на уровне родителя
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      {/* Search + Filter */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1">
          <SearchInput value={searchQuery} onChange={setSearchQuery} />
        </div>
        <IconBtn
          ref={filterBtnRef}
          variant="outline"
          className={`w-12 h-12 shrink-0 ${filterOpen || selectedCategory ? "border-primary text-primary" : ""}`}
          onClick={() => setFilterOpen((v) => !v)}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M2.5 5.83333H17.5M5.83333 10H14.1667M8.33333 14.1667H11.6667"
              stroke={
                filterOpen || selectedCategory
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
            label="Категория"
            options={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <>
          {/* Десктоп: сетка карточек */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProcedureCardSkeleton key={i} />
            ))}
          </div>

          {/* Мобайл: компактный список строк */}
          <div className="md:hidden flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProcedureRowSkeleton key={i} />
            ))}
          </div>
        </>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-border">
          <p className="text-muted text-lg">
            {searchQuery || selectedCategory
              ? "Процедуры не найдены"
              : "Процедур пока нет"}
          </p>
        </div>
      ) : (
        <>
          {/* Десктоп: сетка карточек */}
          <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredItems.map((procedure) => (
              <ProcedureCard
                key={procedure.id}
                {...procedure}
                onDelete={setPendingDeleteId}
              />
            ))}
          </div>

          {/* Мобайл: компактный список строк */}
          <div className="md:hidden flex flex-col gap-3">
            {filteredItems.map((procedure) => (
              <ProcedureRow
                key={procedure.id}
                {...procedure}
                onDelete={setPendingDeleteId}
              />
            ))}
          </div>
        </>
      )}

      <ConfirmDialog
        isOpen={pendingDeleteId !== null}
        onClose={() => setPendingDeleteId(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={isDeleting}
        closeOnConfirm={false}
        variant="danger"
        title="Удалить процедуру?"
        description="Это действие нельзя отменить"
        confirmLabel="Удалить"
        cancelLabel="Отмена"
      />
    </div>
  );
};
