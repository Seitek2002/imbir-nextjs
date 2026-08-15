"use client";

import { FC, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AppointmentDateTimePicker } from "@/widgets/appointment-datetime-picker";

import {
  getDoctorAvailableSlots,
  profileKeys,
  rescheduleAppointment,
} from "@/shared/api";
import { groupAvailableSlots, toApiDate } from "@/shared/lib/booking";
import { extractErrorMessage } from "@/shared/lib/errors";
import { Button, Modal } from "@/shared/ui";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  doctorId: string;
  serviceId?: string | number | null;
  // Формат консультации не меняется при переносе — нужен только чтобы пикер
  // отрисовался в правильном режиме (сам переключатель скрыт).
  isOnline: boolean;
};

// Перенос записи на новую дату/время (POST /api/appointments/{id}/reschedule/).
// LiveKit-комната остаётся привязана к id записи; бэк пошлёт системное
// сообщение в чат врача и пациента.
export const RescheduleModal: FC<Props> = ({
  isOpen,
  onClose,
  appointmentId,
  doctorId,
  serviceId,
  isOnline,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const selectedDateStr = selectedDate ? toApiDate(selectedDate) : null;

  // Свободные слоты того же врача — тот же источник, что и в форме записи.
  const {
    data: slotsData,
    isLoading: isLoadingSlots,
    refetch: refetchSlots,
  } = useQuery({
    queryKey: [
      "reschedule-available-slots",
      doctorId,
      selectedDateStr,
      serviceId,
    ],
    queryFn: () =>
      getDoctorAvailableSlots(doctorId, selectedDateStr as string, serviceId),
    enabled: Boolean(doctorId) && Boolean(selectedDateStr),
  });

  const timeGroups = useMemo(
    () => groupAvailableSlots(slotsData?.slots ?? []),
    [slotsData],
  );

  const { mutate: submit, isPending } = useMutation({
    mutationFn: () =>
      rescheduleAppointment(Number(appointmentId), {
        date: selectedDateStr as string,
        time: selectedTime as string,
      }),
    onSuccess: () => {
      toast.success("Запись перенесена");
      queryClient.invalidateQueries({
        queryKey: [...profileKeys.all, "appointments"],
      });
      handleClose();
    },
    onError: (err: unknown) => {
      const errData = (err as { response?: { data?: Record<string, unknown> } })
        ?.response?.data;
      if (
        errData?.time &&
        Array.isArray(errData.time) &&
        errData.time.length > 0
      ) {
        setSelectedTime(null);
        toast.error("Это время только что заняли. Выберите другой слот.");
        refetchSlots();
        return;
      }
      toast.error(extractErrorMessage(errData, "Не удалось перенести запись"));
    },
  });

  const handleClose = () => {
    setSelectedDate(null);
    setSelectedTime(null);
    onClose();
  };

  // Прошедшие даты выбрать нельзя.
  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Перенести запись">
      <div className="flex flex-col gap-4">
        <AppointmentDateTimePicker
          mode={isOnline ? "online" : "offline"}
          onModeChange={() => {}}
          hideModeToggle
          selectedDate={selectedDate}
          onDateChange={(date) => {
            setSelectedDate(date);
            setSelectedTime(null);
          }}
          selectedTime={selectedTime}
          onTimeChange={setSelectedTime}
          timeGroups={timeGroups}
          isLoadingSlots={isLoadingSlots}
          isDateDisabled={isDateDisabled}
        />

        <Button
          className="w-full justify-center"
          disabled={!selectedDate || !selectedTime || isPending}
          onClick={() => submit()}
        >
          {isPending ? "Переносим..." : "Перенести"}
        </Button>
      </div>
    </Modal>
  );
};
