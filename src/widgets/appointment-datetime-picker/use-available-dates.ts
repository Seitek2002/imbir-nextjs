"use client";

import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { getDoctorAvailableDates } from "@/shared/api";
import { BOOKING_HORIZON_DAYS, toApiDate } from "@/shared/lib/booking";
import { todayInBookingZone } from "@/shared/lib/datetime";

type Options = {
  doctorId: null | number | string | undefined;
  enabled?: boolean;
  // При переносе: своя же запись не должна занимать время, на которое её двигают.
  excludeAppointmentId?: null | number | string;
  // Прошлое, горизонт записи и выходные врача — то, что известно и без бэка.
  isDateDisabled: (date: Date) => boolean;
  // Ключ кеша свой у записи и переноса — их слоты инвалидируют по отдельности.
  queryKey: string;
  serviceId?: null | number | string;
};

/**
 * К фильтру дат календаря добавляет «на эту дату есть свободное время»: день
 * по графику врача может быть занят целиком, и раньше пациент узнавал об этом,
 * только открыв его и увидев пустой список слотов. Теперь такие дни серые, а
 * зелёные — те, где слот реально есть (бэк считает их теми же правилами, что и
 * сами слоты, с учётом длительности услуги).
 *
 * Пока ответ не пришёл — или бэк ещё без этого запроса, или он упал — отдаём
 * исходный фильтр: календарь работает как раньше, по графику врача.
 */
export const useAvailableDatesFilter = ({
  doctorId,
  enabled = true,
  excludeAppointmentId,
  isDateDisabled,
  queryKey,
  serviceId,
}: Options) => {
  const today = todayInBookingZone();
  const from = toApiDate(today);
  const to = toApiDate(
    new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + BOOKING_HORIZON_DAYS,
    ),
  );

  const { data } = useQuery({
    queryKey: [
      queryKey,
      doctorId ?? null,
      serviceId ?? null,
      excludeAppointmentId ?? null,
      from,
    ],
    queryFn: () =>
      getDoctorAvailableDates(
        doctorId as number | string,
        from,
        to,
        serviceId,
        excludeAppointmentId,
      ),
    enabled: enabled && Boolean(doctorId),
    // Слоты занимают другие пациенты прямо сейчас — как и у самих слотов,
    // глобальные staleTime 60 с и refetchOnWindowFocus: false здесь не годятся.
    staleTime: 0,
    refetchOnWindowFocus: true,
    // Улучшение, а не условие записи: при ошибке повторы только задерживали бы
    // календарь, который и так работает по графику.
    retry: false,
  });

  const availableDates = useMemo(
    () => (data ? new Set(data.dates) : null),
    [data],
  );

  return useMemo(() => {
    if (!availableDates) return isDateDisabled;
    return (date: Date) =>
      isDateDisabled(date) || !availableDates.has(toApiDate(date));
  }, [availableDates, isDateDisabled]);
};
