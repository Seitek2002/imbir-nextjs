"use client";

import { useQuery } from "@tanstack/react-query";

import {
  clinicCabinetKeys,
  doctorCabinetKeys,
  getClinicAppointments,
  getDoctorStats,
} from "@/shared/api";

import { useSoundOnIncrease } from "./notificationSound";

// Счётчик «новых записей» обновляется раз в минуту, пока вкладка открыта:
// иначе звук нового уведомления не услышать, пока не перезагрузишь страницу.
// Тот же интервал, что у счётчика чата в шапке.
const POLL_MS = 60_000;

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
    refetchInterval: POLL_MS,
  });

  const count = data?.appointments.pending;
  useSoundOnIncrease("appointment", count);

  return count ?? 0;
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
    refetchInterval: POLL_MS,
  });

  const count = data?.pagination.total;
  useSoundOnIncrease("appointment", count);

  return count ?? 0;
};
