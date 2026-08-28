"use client";

import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import { api, doctorKeys } from "@/shared/api";
import { useAuthStore } from "@/shared/store";

// Места приёма врача — нужны, чтобы привязать услугу к клинике.
//
// Отдельного эндпоинта в кабинете нет (в /api/doctor/profile/ клиник не
// отдают), поэтому берём публичную карточку врача: id профиля совпадает с id
// пользователя — так же устроена и клиника (пользователь 199 = клиника 199).
// Ключ тот же, что у публичной страницы врача, так что данные переиспользуются.
export const useDoctorClinics = () => {
  const userId = useAuthStore((state) => state.user?.id);
  const doctorId = userId === undefined ? "" : String(userId);

  const { data, isLoading } = useQuery({
    queryKey: doctorKeys.detail(doctorId),
    queryFn: () => api.getDoctorById(doctorId),
    enabled: doctorId !== "",
  });

  const options = useMemo(
    () =>
      (data?.workplaces ?? [])
        .filter((place) => place.clinicId)
        .map((place) => ({
          value: place.clinicId,
          // Название может не прийти — тогда подписываем адресом, иначе в
          // списке был бы пустой пункт, который нельзя отличить от соседнего.
          label: place.clinicName || place.clinicAddress || "Без названия",
        })),
    [data],
  );

  return {
    options,
    // Спрашиваем клинику, только когда выбор действительно есть: одну бэк
    // подставляет сам, при нуле услуга остаётся без клиники.
    isRequired: options.length > 1,
    isLoading,
  };
};
