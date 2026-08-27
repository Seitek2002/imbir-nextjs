"use client";

import { useQuery } from "@tanstack/react-query";

import {
  clinicCabinetKeys,
  doctorCabinetKeys,
  getClinicAppointments,
  getDoctorStats,
} from "@/shared/api";

/**
 * Сколько записей ждёт реакции кабинета.
 *
 * «Новая запись» = status `pending`: пациент записался, а врач или клиника
 * ещё не подтвердили. Другого признака новизны бэк не даёт — приложение
 * `notifications` там заведено (модель, три ручки, в INSTALLED_APPS), но
 * уведомления никто не создаёт: producer'ов в коде нет вообще, поэтому
 * `unread_count` всегда 0. Строить счётчик на нём значило бы рисовать
 * заведомо мёртвый ноль, а `pending` — настоящее состояние записи.
 *
 * Обе роли ходят в кабинет и сайдбаром, и мобильным меню; ключи запросов
 * общие, так что react-query отдаёт один ответ на оба места.
 */
export const usePendingDoctorAppointments = (): number => {
  const { data } = useQuery({
    queryKey: doctorCabinetKeys.stats(),
    queryFn: getDoctorStats,
  });

  return data?.appointments.pending ?? 0;
};

/**
 * У клиники готового счётчика в /api/clinic/stats/ нет (там выручка, просмотры
 * и число врачей), поэтому берём его из самого списка: page_size=1 — сервер
 * вернёт одну запись, а нужное число лежит в pagination.total.
 */
export const usePendingClinicAppointments = (): number => {
  const filters = { status: "pending", page_size: 1 } as const;

  const { data } = useQuery({
    queryKey: clinicCabinetKeys.appointments(filters),
    queryFn: () => getClinicAppointments(filters),
  });

  return data?.pagination.total ?? 0;
};
