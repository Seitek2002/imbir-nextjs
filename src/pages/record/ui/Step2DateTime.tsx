import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { AppointmentDateTimePicker } from "@/widgets/appointment-datetime-picker";

import { ROUTES, loginHref } from "@/shared/config";
import {
  formatDuration,
  formatTimeRange,
  hasDuration,
} from "@/shared/lib/duration";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui";

import type { RecordForm } from "../model/use-record-form";
import { StepTitle } from "./StepTitle";

export const Step2DateTime = ({ form }: { form: RecordForm }) => {
  const {
    mobileStep,
    isAuthenticated,
    selectedClinicId,
    selectedDoctorId,
    selectedServiceId,
    selectedService,
    slotNotice,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    timeGroups,
    isLoadingSlots,
    isStep2Complete,
    setMobileStep,
  } = form;
  const searchParams = useSearchParams();

  // После входа возвращаемся в эту же форму с уже выбранными клиникой,
  // врачом и услугой (форма читает их из URL), а не в кабинет.
  const loginParams = new URLSearchParams(searchParams?.toString());
  for (const [key, value] of [
    ["clinic", selectedClinicId],
    ["doctor", selectedDoctorId],
    ["service", selectedServiceId],
  ] as const) {
    if (value) loginParams.set(key, value);
    else loginParams.delete(key);
  }
  const loginQuery = loginParams.toString();
  const loginLink = loginHref(
    loginQuery ? `${ROUTES.RECORD}?${loginQuery}` : ROUTES.RECORD,
  );

  return (
    <section
      id="record-step-2"
      className={cn(
        "p-4 lg:p-6 lg:border-t lg:border-border-soft",
        mobileStep !== 2 && "hidden",
        "lg:block",
      )}
    >
      <StepTitle number={2} title="Выберите дату и время" />

      {/* Приёмы только онлайн, но бэк запрещает онлайн-запись без аккаунта
          («Онлайн-запись доступна только авторизованным пользователям», 400),
          поэтому гостю говорим прямо, чего он лишается. */}
      {!isAuthenticated && (
        <p className="text-xs text-muted mb-3">
          Видеозвонок с врачом доступен после{" "}
          <Link
            href={loginLink}
            className="text-primary underline hover:no-underline"
          >
            авторизации
          </Link>
          . Без входа запись оформится без ссылки на консультацию.
        </p>
      )}

      {/* Без этой строки серые слоты посреди свободного дня выглядели
          ошибкой: длинная услуга не помещается перед перерывом или концом
          дня, хотя короткая туда бы встала. На мобильном это единственное
          место, где видно длительность и время окончания. */}
      {selectedService && hasDuration(selectedService.duration) && (
        <p className="text-xs text-muted mb-3">
          Услуга длится {formatDuration(selectedService.duration)} — свободным
          показано только время, когда она целиком помещается в график врача.
          {selectedTime && (
            <>
              {" "}
              Приём: {formatTimeRange(selectedTime, selectedService.duration)}.
            </>
          )}
        </p>
      )}

      {slotNotice && (
        <p role="alert" className="text-sm text-red-500 mb-3">
          {slotNotice}
        </p>
      )}

      <AppointmentDateTimePicker
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
