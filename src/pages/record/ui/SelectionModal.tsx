"use client";

import { useCallback, useState } from "react";

import { RemoveIcon } from "@/shared/assets/icons";
import { useScrollLock } from "@/shared/lib/useScrollLock";
import { Button, IconBtn, SearchInput } from "@/shared/ui";

import { formatPrice } from "../model/lib";
import type { RecordForm } from "../model/use-record-form";
import { SelectionListItem } from "./SelectionListItem";

const DURATION = 200;

export const SelectionModal = ({ form }: { form: RecordForm }) => {
  const {
    activeModal,
    modalConfig,
    searchQuery,
    setSearchQuery,
    filteredModalItems,
    clinicMap,
    selectedClinic,
    selectedDoctor,
    selectedServiceIds,
    totalPrice,
    closeModal,
    handleModalItemSelect,
    isDoctorModalLoading,
  } = form;

  const [isClosing, setIsClosing] = useState(false);
  const isOpen = Boolean(activeModal);
  const isMulti = activeModal === "service";

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      closeModal();
    }, DURATION);
  }, [closeModal]);

  useScrollLock(isOpen);

  if (!isOpen && !isClosing) return null;
  const state = isClosing ? "closed" : "open";

  const isSelected = (id: string): boolean => {
    if (activeModal === "clinic") return selectedClinic?.id === id;
    if (activeModal === "doctor") return selectedDoctor?.id === id;
    return selectedServiceIds.includes(id);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3">
      <div
        className="modal-overlay absolute inset-0 bg-overlay/40 backdrop-blur-[2px]"
        data-state={state}
        onClick={handleClose}
      />

      <div
        className="modal-panel relative w-full max-w-138 rounded-3xl border border-border-soft bg-white p-4 lg:p-5"
        data-state={state}
      >
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-[28px] text-foreground leading-[130%] font-semibold">
            {modalConfig?.title}
          </h3>

          <IconBtn
            variant="outline"
            size="sm"
            onClick={handleClose}
            aria-label="Закрыть"
          >
            <RemoveIcon className="size-4" />
          </IconBtn>
        </div>

        <div className="mt-4">
          <SearchInput
            placeholder={modalConfig?.searchPlaceholder}
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>

        <div className="mt-3 max-h-95 overflow-y-auto pr-1 space-y-2">
          {isDoctorModalLoading ? (
            <p className="text-sm text-muted text-center py-6">
              Загрузка врачей клиники...
            </p>
          ) : filteredModalItems.length > 0 ? (
            filteredModalItems.map((item) => (
              <SelectionListItem
                key={item.id}
                item={item}
                clinicMap={clinicMap}
                selected={isSelected(item.id)}
                isMulti={isMulti}
                onSelect={() => handleModalItemSelect(item.id)}
              />
            ))
          ) : (
            <p className="text-sm text-muted text-center py-6">
              Ничего не найдено
            </p>
          )}
        </div>

        {/* Услуги можно выбрать несколько — показываем бегущий итог и явную
            кнопку завершения (модалка не закрывается по клику на пункт). */}
        {isMulti && (
          <div className="mt-4 pt-4 border-t border-border-soft flex items-center justify-between gap-3">
            <div>
              <p className="text-secondary text-sm">
                Выбрано: {selectedServiceIds.length}
              </p>
              <p className="text-foreground font-semibold text-lg">
                {formatPrice(totalPrice)}
              </p>
            </div>
            <Button size="lg" onClick={handleClose}>
              Готово
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
