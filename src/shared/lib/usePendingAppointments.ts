"use client";

import { useEffect } from "react";

import { type QueryKey, useQuery, useQueryClient } from "@tanstack/react-query";

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

// Последнее увиденное значение счётчика — общее на все места, где висит хук
// (сайдбар и мобильное меню), чтобы списки перезапрашивались один раз.
const lastCount: Partial<Record<"clinic" | "doctor", number>> = {};

/**
 * Счётчик вырос — пришла новая запись: перечитываем списки записей кабинета.
 * Иначе бейдж и звук сообщали о записи, которой в открытом списке «Записи»
 * нет до ухода со страницы или перезагрузки.
 */
const useRefreshListsOnIncrease = (
  role: "clinic" | "doctor",
  count: number | undefined,
  listsKey: QueryKey,
) => {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (count === undefined) return;
    const previous = lastCount[role];
    lastCount[role] = count;
    if (previous === undefined || count <= previous) return;
    queryClient.invalidateQueries({ queryKey: listsKey });
  }, [role, count, listsKey, queryClient]);
};

const DOCTOR_LISTS_KEY = [...doctorCabinetKeys.all, "appointments"] as const;
const CLINIC_LISTS_KEY = [...clinicCabinetKeys.all, "appointments"] as const;

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
  useRefreshListsOnIncrease("doctor", count, DOCTOR_LISTS_KEY);

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
  useRefreshListsOnIncrease("clinic", count, CLINIC_LISTS_KEY);

  return count ?? 0;
};
