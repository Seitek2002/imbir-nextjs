"use client";

import { useMemo } from "react";

import { useQuery } from "@tanstack/react-query";

import {
  api,
  doctorCabinetKeys,
  doctorKeys,
  getDoctorProfile,
} from "@/shared/api";
import { useAuthStore } from "@/shared/store";

// Места приёма врача — нужны, чтобы привязать услугу к клинике.
//
// Берём их из профиля кабинета (/api/doctor/profile/, поле clinics). Раньше
// источником была публичная карточка врача: снятому с публикации врачу она
// отдаёт 404 (клиник нет — добавить услугу нельзя), после принятия
// приглашения могла быть закеширована со старым списком, а каждый запрос
// накручивал врачу просмотры профиля. Ключ — тот же, что у кабинета, так что
// после принятия приглашения список обновляется вместе с профилем.
//
// Старый бэк clinics не отдаёт — тогда, как прежде, берём публичную карточку:
// id профиля совпадает с id пользователя (пользователь 199 = клиника 199).
export const useDoctorClinics = () => {
  const userId = useAuthStore((state) => state.user?.id);
  const doctorId = userId === undefined ? "" : String(userId);

  const profileQuery = useQuery({
    queryKey: doctorCabinetKeys.profile(),
    queryFn: getDoctorProfile,
  });
  const ownClinics = profileQuery.data?.clinics;
  const needsFallback = profileQuery.isSuccess && ownClinics === undefined;

  const publicQuery = useQuery({
    queryKey: doctorKeys.detail(doctorId),
    queryFn: () => api.getDoctorById(doctorId),
    enabled: needsFallback && doctorId !== "",
  });

  const options = useMemo(() => {
    if (ownClinics) {
      return ownClinics.map((clinic) => ({
        value: String(clinic.id),
        // Название может не прийти — тогда подписываем адресом филиала,
        // иначе в списке был бы пустой пункт.
        label: clinic.name || clinic.branch?.address || "Без названия",
      }));
    }
    return (publicQuery.data?.workplaces ?? [])
      .filter((place) => place.clinicId)
      .map((place) => ({
        value: place.clinicId,
        label: place.clinicName || place.clinicAddress || "Без названия",
      }));
  }, [ownClinics, publicQuery.data]);

  return {
    options,
    // Спрашиваем клинику, только когда выбор действительно есть: одну бэк
    // подставляет сам, при нуле услуга остаётся без клиники.
    isRequired: options.length > 1,
    isLoading:
      profileQuery.isLoading || (needsFallback && publicQuery.isLoading),
  };
};
