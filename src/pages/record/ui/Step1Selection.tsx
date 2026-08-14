import { cn } from "@/shared/lib/utils";
import { Button, SearchInput } from "@/shared/ui";

import type { RecordForm } from "../model/use-record-form";
import { LoadingState } from "./LoadingState";
import { SelectField } from "./SelectField";
import { SelectionListItem } from "./SelectionListItem";
import { StepTitle } from "./StepTitle";

export const Step1Selection = ({ form }: { form: RecordForm }) => {
  const {
    mobileStep,
    selectedClinic,
    selectedDoctor,
    selectedService,
    openModal,
    mobileStep1Config,
    mobileSelectionStage,
    searchQuery,
    setSearchQuery,
    filteredMobileStep1Items,
    clinicMap,
    hasMoreClinics,
    isFetchingMoreClinics,
    fetchMoreClinics,
    handleMobileStep1Select,
    isMobileStageLoading,
    workplaceOptions,
  } = form;

  // У врача может не быть ни одного места приёма (зарегистрировался сам, без
  // клиники). Тогда поле «Клиника» открывало модалку «Выберите место приёма»
  // с пустым списком и надписью «Ничего не найдено» — тупик. Запись при этом
  // проходит без клиники (clinic_id опционален), так что поле просто убираем.
  const hideClinicField =
    !selectedClinic && !!selectedDoctor && workplaceOptions.length === 0;

  return (
    <section
      className={cn("p-4 lg:p-6", mobileStep !== 1 && "hidden", "lg:block")}
    >
      <div className="hidden lg:block">
        <StepTitle number={1} title="Выберите" />

        <div className="space-y-3 max-w-full lg:max-w-75">
          {!hideClinicField && (
            <SelectField
              label="Клиника"
              value={selectedClinic?.name}
              placeholder="Выберите из списка"
              onClick={() =>
                // Врач уже выбран, а клиника — ещё нет: значит, выбор места
                // работы для него не завершён (несколько мест работы), и
                // открывать нужно именно его список, а не все клиники подряд.
                openModal(
                  !selectedClinic && selectedDoctor ? "workplace" : "clinic",
                )
              }
            />
          )}

          <SelectField
            label="Специалист"
            value={selectedDoctor?.name}
            placeholder="Выберите из списка"
            onClick={() => openModal("doctor")}
          />

          <SelectField
            label="Услуга"
            value={selectedService?.title}
            placeholder="Выберите из списка"
            onClick={() => openModal("service")}
          />
        </div>
      </div>

      <div className="lg:hidden">
        <h2 className="text-[40px] text-foreground leading-none font-semibold">
          {mobileStep1Config.title}
        </h2>

        <div className="mt-3">
          <SearchInput
            placeholder={mobileStep1Config.searchPlaceholder}
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>

        <div className="mt-3 max-h-[52vh] overflow-y-auto pr-1 space-y-2">
          {isMobileStageLoading ? (
            <LoadingState />
          ) : filteredMobileStep1Items.length > 0 ? (
            filteredMobileStep1Items.map((item) => (
              <SelectionListItem
                key={item.id}
                item={item}
                clinicMap={clinicMap}
                compact
                selected={mobileStep1Config.selectedId === item.id}
                onSelect={() => handleMobileStep1Select(item.id)}
              />
            ))
          ) : (
            <p className="text-sm text-muted text-center py-6">
              Ничего не найдено
            </p>
          )}
        </div>

        {mobileSelectionStage === "clinic" && hasMoreClinics && (
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
    </section>
  );
};
