"use client";

import { FC, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AppointmentDateTimePicker } from "@/widgets/appointment-datetime-picker";

import {
  getDoctorAvailableSlots,
  profileKeys,
  rescheduleAppointment,
} from "@/shared/api";
import { groupAvailableSlots, toApiDate } from "@/shared/lib/booking";
import {
  formatDuration,
  formatTimeRange,
  hasDuration,
} from "@/shared/lib/duration";
import { extractErrorMessage } from "@/shared/lib/errors";
import { Button, Modal } from "@/shared/ui";

type Props = {
  appointmentId: string;
  doctorId: string;
  isOpen: boolean;
  onClose: () => void;
  // Минуты услуги записи — для подсказки «Приём: 15:00–16:00».
  serviceDuration?: null | number;
  serviceId?: null | number | string;
  // Формат консультации не меняется при переносе — нужен только чтобы пикер
  // отрисовался в правильном режиме (сам переключатель скрыт).
};

// Перенос записи на новую дату/время (POST /api/appointments/{id}/reschedule/).
// LiveKit-комната остаётся привязана к id записи; бэк пошлёт системное
// сообщение в чат врача и пациента.
export const RescheduleModal: FC<Props> = ({
  isOpen,
  onClose,
  appointmentId,
  doctorId,
  serviceDuration,
  serviceId,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<null | string>(null);
  const queryClient = useQueryClient();

  const selectedDateStr = selectedDate ? toApiDate(selectedDate) : null;

  // Свободные слоты того же врача — тот же источник, что и в форме записи.
  const {
    data: slotsData,
    isFetching: isFetchingSlots,
    isLoading: isLoadingSlots,
    refetch: refetchSlots,
  } = useQuery({
    queryKey: [
      "reschedule-available-slots",
      doctorId,
      selectedDateStr,
      serviceId,
      appointmentId,
    ],
    queryFn: () =>
      getDoctorAvailableSlots(
        doctorId,
        selectedDateStr as string,
        serviceId,
        appointmentId,
      ),
    enabled: Boolean(doctorId) && Boolean(selectedDateStr),
    // Как и в форме записи: слоты меняются в реальном времени, кеш на минуту
    // показывал занятое время свободным.
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  const timeGroups = useMemo(
    () => groupAvailableSlots(slotsData?.slots ?? []),
    [slotsData],
  );

  // Как в форме записи: время, которое по свежим слотам больше не свободно,
  // снимаем сразу, а не после отказа бэка.
  const [checkedSlots, setCheckedSlots] = useState(slotsData);
  const [slotNotice, setSlotNotice] = useState<null | string>(null);
  if (!isFetchingSlots && slotsData !== checkedSlots) {
    setCheckedSlots(slotsData);
    const isStillFree = slotsData?.slots.some(
      (s) => s.time === selectedTime && s.available,
    );
    if (selectedTime && slotsData && !isStillFree) {
      setSelectedTime(null);
      setSlotNotice(`Время ${selectedTime} уже недоступно — выберите другое`);
    }
  }
  if (selectedTime && slotNotice) setSlotNotice(null);
  useEffect(() => {
    if (slotNotice) toast.error(slotNotice, { id: "reschedule-slot-reset" });
    else toast.dismiss("reschedule-slot-reset");
  }, [slotNotice]);

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
      // Перенос освобождает старый слот и занимает новый.
      queryClient.invalidateQueries({ queryKey: ["record-available-slots"] });
      queryClient.invalidateQueries({
        queryKey: ["reschedule-available-slots"],
      });
      handleClose();
    },
    onError: (err: unknown) => {
      const errData = (err as { response?: { data?: Record<string, unknown> } })
        ?.response?.data;
      const timeErrors = errData?.time;
      if (Array.isArray(timeErrors) && timeErrors.length > 0) {
        setSelectedTime(null);
        // Бэк объясняет причину сам: занято другим пациентом, не помещается
        // в рабочий день или задевает перерыв врача.
        toast.error(String(timeErrors[0]));
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
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Перенести запись"
      panelClassName="max-w-3xl"
    >
      <div className="flex flex-col gap-4">
        {hasDuration(serviceDuration) && (
          <p className="text-xs text-muted">
            Приём длится {formatDuration(serviceDuration)} — свободным показано
            только время, когда он целиком помещается в график врача.
            {selectedTime && (
              <>
                {" "}
                Новое время: {formatTimeRange(selectedTime, serviceDuration)}.
              </>
            )}
          </p>
        )}
        <AppointmentDateTimePicker
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
