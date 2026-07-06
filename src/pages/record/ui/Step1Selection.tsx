import { cn } from "@/shared/lib/utils";
import { Button, SearchInput } from "@/shared/ui";

import type { RecordForm } from "../model/use-record-form";
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
    searchQuery,
    setSearchQuery,
    filteredMobileStep1Items,
    clinicMap,
    handleMobileStep1Select,
    handleMobileStep1Continue,
    isDoctorStageLoading,
  } = form;

  return (
    <section
      className={cn("p-4 lg:p-6", mobileStep !== 1 && "hidden", "lg:block")}
    >
      <div className="hidden lg:block">
        <StepTitle number={1} title="Выберите" />

        <div className="space-y-3 max-w-full lg:max-w-75">
          <SelectField
            label="Клиника"
            value={selectedClinic?.name}
            placeholder="Выберите из списка"
            onClick={() => openModal("clinic")}
          />

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
          {isDoctorStageLoading ? (
            <p className="text-sm text-muted text-center py-6">
              Загрузка врачей клиники...
            </p>
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

        <div className="mt-4 pt-3 border-t border-[#E9EBEE]">
          <Button
            className="w-full justify-center"
            size="lg"
            disabled={!mobileStep1Config.selectedId}
            onClick={handleMobileStep1Continue}
          >
            Продолжить
          </Button>
        </div>
      </div>
    </section>
  );
};
