"use client";

import { useCallback, useState } from "react";

import { RemoveIcon } from "@/shared/assets/icons";
import { useScrollLock } from "@/shared/lib/useScrollLock";
import { Button, IconBtn, SearchInput } from "@/shared/ui";

import type { RecordForm } from "../model/use-record-form";
import { LoadingState } from "./LoadingState";
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
    hasMoreClinics,
    isFetchingMoreClinics,
    fetchMoreClinics,
    selectedClinicId,
    selectedClinic,
    selectedDoctor,
    selectedServiceId,
    closeModal,
    handleModalItemSelect,
    isModalLoading,
  } = form;

  const [isClosing, setIsClosing] = useState(false);
  const isOpen = Boolean(activeModal);

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
    if (activeModal === "workplace") return selectedClinicId === id;
    return selectedServiceId === id;
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
          <div className="flex items-center gap-2">
            <h3 className="text-[28px] text-foreground leading-[130%] font-semibold">
              {modalConfig?.title}
            </h3>
          </div>

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
          {isModalLoading ? (
            <LoadingState />
          ) : filteredModalItems.length > 0 ? (
            filteredModalItems.map((item) => (
              <SelectionListItem
                key={item.id}
                item={item}
                clinicMap={clinicMap}
                selected={isSelected(item.id)}
                onSelect={() => handleModalItemSelect(item.id)}
              />
            ))
          ) : (
            <p className="text-sm text-muted text-center py-6">
              Ничего не найдено
            </p>
          )}
        </div>

        {activeModal === "clinic" && hasMoreClinics && (
          <div className="flex justify-center mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchMoreClinics()}
              loading={isFetchingMoreClinics}
            >
              {isFetchingMoreClinics ? "Загрузка…" : "Показать ещё"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
