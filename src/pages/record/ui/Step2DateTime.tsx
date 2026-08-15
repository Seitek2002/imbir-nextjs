import { AppointmentDateTimePicker } from "@/widgets/appointment-datetime-picker";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui";

import type { RecordForm } from "../model/use-record-form";
import { StepTitle } from "./StepTitle";

export const Step2DateTime = ({ form }: { form: RecordForm }) => {
  const {
    mobileStep,
    mode,
    setMode,
    canUseOnline,
    selectedDoctorId,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    timeGroups,
    isLoadingSlots,
    isStep2Complete,
    setMobileStep,
  } = form;

  return (
    <section
      className={cn(
        "p-4 lg:p-6 lg:border-t lg:border-border-soft",
        mobileStep !== 2 && "hidden",
        "lg:block",
      )}
    >
      <StepTitle number={2} title="Выберите дату и время" />

      <AppointmentDateTimePicker
        mode={mode}
        onModeChange={setMode}
        canUseOnline={canUseOnline}
        isDoctorSelected={Boolean(selectedDoctorId)}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        selectedTime={selectedTime}
        onTimeChange={setSelectedTime}
        timeGroups={timeGroups}
        isLoadingSlots={isLoadingSlots}
        isDateDisabled={(date) => {
          const now = new Date();
          const startOfToday = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate(),
          );
          return date < startOfToday;
        }}
      />

      <div className="lg:hidden mt-6">
        <Button
          className="w-full justify-center"
          size="lg"
          onClick={() => {
            if (!isStep2Complete) return;
            setMobileStep(3);
          }}
        >
          Продолжить
        </Button>
      </div>
    </section>
  );
};
