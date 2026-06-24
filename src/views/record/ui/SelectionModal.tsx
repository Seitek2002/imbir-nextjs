import { Button, IconBtn, SearchInput } from "@/shared";

import { RemoveIcon } from "@/shared/assets";

import type { RecordForm } from "../model/use-record-form";
import { SelectionListItem } from "./SelectionListItem";

export const SelectionModal = ({ form }: { form: RecordForm }) => {
  const {
    modalConfig,
    searchQuery,
    setSearchQuery,
    filteredModalItems,
    clinicMap,
    modalDraftSelection,
    setModalDraftSelection,
    closeModal,
    applyModalSelection,
  } = form;

  if (!modalConfig) return null;

  return (
    <div className="fixed inset-0 z-50 bg-overlay/40 backdrop-blur-[2px] flex items-center justify-center p-3">
      <div className="w-full max-w-138 rounded-3xl border border-border-soft bg-white p-4 lg:p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-[28px] text-foreground leading-[130%] font-semibold">
            {modalConfig.title}
          </h3>

          <IconBtn
            variant="outline"
            size="sm"
            onClick={closeModal}
            aria-label="Закрыть"
          >
            <RemoveIcon className="size-4" />
          </IconBtn>
        </div>

        <div className="mt-4">
          <SearchInput
            placeholder={modalConfig.searchPlaceholder}
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>

        <div className="mt-3 max-h-95 overflow-y-auto pr-1 space-y-2">
          {filteredModalItems.length > 0 ? (
            filteredModalItems.map((item) => (
              <SelectionListItem
                key={item.id}
                item={item}
                clinicMap={clinicMap}
                selected={modalDraftSelection === item.id}
                onSelect={() => setModalDraftSelection(item.id)}
              />
            ))
          ) : (
            <p className="text-sm text-muted text-center py-6">
              Ничего не найдено
            </p>
          )}
        </div>

        <div className="mt-4">
          <Button
            className="w-full justify-center"
            size="lg"
            disabled={!modalDraftSelection}
            onClick={applyModalSelection}
          >
            Выбрать
          </Button>
        </div>
      </div>
    </div>
  );
};
