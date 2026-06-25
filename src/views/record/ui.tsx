"use client";

import { Header } from "@/widgets/header";

import { HeaderBackIcon } from "@/shared/assets/icons";
import { ROUTES } from "@/shared/config/routes";
import { IconBtn } from "@/shared/ui";

import { useRecordForm } from "./model/use-record-form";
import { MobileStepsProgress } from "./ui/MobileStepsProgress";
import { SelectionModal } from "./ui/SelectionModal";
import { Step1Selection } from "./ui/Step1Selection";
import { Step2DateTime } from "./ui/Step2DateTime";
import { Step3PatientForm } from "./ui/Step3PatientForm";
import { SuccessModal } from "./ui/SuccessModal";
import { SummaryCard } from "./ui/SummaryCard";

export const RecordPage = () => {
  const form = useRecordForm();
  const {
    router,
    mobileStep,
    handleRecordBack,
    selectedDoctor,
    selectedService,
    mode,
    selectedDate,
    selectedTime,
    showSuccess,
    setShowSuccess,
  } = form;

  return (
    <main className="min-h-screen bg-background lg:bg-white flex flex-col">
      <Header
        title="Оформление записи"
        backTo={ROUTES.HOME}
        onBack={handleRecordBack}
      >
        <MobileStepsProgress currentStep={mobileStep} totalSteps={3} />
      </Header>

      <div className="hidden lg:block w-full max-w-340 mx-auto px-10 pt-6">
        <div className="flex items-center gap-3">
          <IconBtn variant="outline" size="sm" onClick={() => router.back()}>
            <HeaderBackIcon className="size-4" />
          </IconBtn>
          <h1 className="text-[28px] font-semibold text-foreground leading-[130%]">
            Оформление записи
          </h1>
        </div>
      </div>

      <div className="w-full max-w-340 mx-auto px-4 lg:px-10 py-4 lg:py-6 pb-10 flex-1">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-6">
          <div className="rounded-3xl border border-border-soft bg-white overflow-hidden">
            <Step1Selection form={form} />
            <Step2DateTime form={form} />
            <Step3PatientForm form={form} />
          </div>

          <div className="hidden lg:block">
            {selectedDoctor && selectedService && (
              <SummaryCard
                doctor={selectedDoctor}
                service={selectedService}
                mode={mode}
                selectedDate={selectedDate}
                selectedTime={selectedTime}
              />
            )}
          </div>
        </div>
      </div>

      <SelectionModal form={form} />

      {showSuccess && <SuccessModal onClose={() => setShowSuccess(false)} />}
    </main>
  );
};
