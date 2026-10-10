import { cn } from "@/shared/lib/utils";
import { Button, SearchInput } from "@/shared/ui";

import type { RecordForm } from "../model/use-record-form";
import { LoadingState } from "./LoadingState";
import { SelectField } from "./SelectField";
import { SelectionListItem } from "./SelectionListItem";
import { StepTitle } from "./StepTitle";

// Формат приёма. Раньше он брался только из ссылки (mode=online) и в форме
// не менялся — сменив врача, нельзя было ни перейти в офлайн, ни вернуться
// в онлайн. Показывается, лишь когда врач онлайн-приём проводит.
const FormatSwitch = ({
  isOnline,
  onChange,
}: {
  isOnline: boolean;
  onChange: (isOnline: boolean) => void;
}) => (
  <div className="space-y-1.5">
    <span className="text-sm font-medium text-overlay">Формат приёма</span>
    <div className="grid grid-cols-2 gap-1 p-1 rounded-lg border border-border-soft">
      {[
        { value: false, label: "Офлайн" },
        { value: true, label: "Онлайн" },
      ].map((option) => (
        <button
          key={option.label}
          type="button"
          aria-pressed={isOnline === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "h-9 rounded-md text-sm font-medium transition-colors",
            isOnline === option.value
              ? "bg-primary text-white"
              : "text-secondary hover:text-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  </div>
);

export const Step1Selection = ({ form }: { form: RecordForm }) => {
  const {
    errors,
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
    isClinicFieldHidden,
    canChooseOnline,
    isOnlineBooking,
    setOnlineBooking,
    formatNotice,
  } = form;

  const formatBlock = canChooseOnline ? (
    <FormatSwitch isOnline={isOnlineBooking} onChange={setOnlineBooking} />
  ) : formatNotice ? (
    <p className="text-sm text-secondary">{formatNotice}</p>
  ) : null;

  return (
    <section
      // Якорь для прокрутки к шагу, который не даёт отправить форму.
      id="record-step-1"
      className={cn("p-4 lg:p-6", mobileStep !== 1 && "hidden", "lg:block")}
    >
      <div className="hidden lg:block">
        <StepTitle number={1} title="Выберите" />

        <div className="space-y-3 max-w-full lg:max-w-75">
          {!isClinicFieldHidden && (
            <SelectField
              label="Клиника"
              value={selectedClinic?.name}
              placeholder="Выберите из списка"
              error={errors.clinic}
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
            error={errors.doctor}
            onClick={() => openModal("doctor")}
          />

          <SelectField
            label="Услуга"
            value={selectedService?.title}
            placeholder="Выберите из списка"
            error={errors.service}
            onClick={() => openModal("service")}
          />

          {formatBlock}
        </div>
      </div>

      <div className="lg:hidden">
        <div className="flex items-center gap-3">
          <h2 className="text-[40px] text-foreground leading-none font-semibold">
            {mobileStep1Config.title}
          </h2>
        </div>

        {/* На мобильном — только после выбора врача: до него формат не важен. */}
        {selectedDoctor && formatBlock && (
          <div className="mt-3">{formatBlock}</div>
        )}

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
            // Пустой список и неудачный поиск — разные ситуации: в первой
            // искать нечего, во второй стоит поменять запрос.
            <p className="text-sm text-muted text-center py-6 px-4">
              {mobileStep1Config.items.length === 0
                ? mobileStep1Config.emptyText
                : "Ничего не найдено — попробуйте изменить запрос"}
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
