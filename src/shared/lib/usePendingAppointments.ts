"use client";

import { useEffect } from "react";

import { useQuery } from "@tanstack/react-query";

import {
  clinicCabinetKeys,
  doctorCabinetKeys,
  getClinicAppointments,
  getDoctorStats,
} from "@/shared/api";

// Счётчик «новых записей» обновляется раз в минуту, пока вкладка открыта:
// иначе звук нового уведомления не услышать, пока не перезагрузишь страницу.
// Тот же интервал, что у счётчика чата в шапке.
const POLL_MS = 60_000;

const SOUND_SRC = "/sounds/new-appointment.wav";

// Звук один на вкладку. Создаём его лениво: до первого касания страницы
// браузер не даст его проиграть сам, и тогда он уходит в «разблокировку».
let audio: HTMLAudioElement | null = null;
let unlockRegistered = false;

const createAudio = () => {
  const element = new Audio(SOUND_SRC);
  element.preload = "auto";
  return element;
};

// Первое касание страницы разрешает браузеру проигрывать звук. Проигрываем
// его беззвучно и сразу останавливаем: для браузера это уже жест пользователя.
const unlockAudio = () => {
  audio ??= createAudio();
  const element = audio;
  element.muted = true;
  element
    .play()
    .then(() => {
      element.pause();
      element.currentTime = 0;
    })
    .catch(() => {})
    .finally(() => {
      element.muted = false;
    });
};

const registerUnlock = () => {
  if (unlockRegistered || typeof document === "undefined") return;
  unlockRegistered = true;
  document.addEventListener("pointerdown", unlockAudio, { once: true });
};

const playNewAppointmentSound = () => {
  audio ??= createAudio();
  audio.currentTime = 0;
  audio.play().catch(() => {});
};

// Последнее известное число записей по каждой роли. Сайдбар и мобильное меню
// вызывают один и тот же хук, поэтому сравниваем с общим значением: звук
// играет один раз, на первое изменение, а не в каждом месте, где хук стоит.
const lastPending: Partial<Record<"clinic" | "doctor", number>> = {};

const useNewAppointmentSound = (
  role: "clinic" | "doctor",
  count: number | undefined,
) => {
  useEffect(() => {
    if (count === undefined) return;
    registerUnlock();

    const previous = lastPending[role];
    lastPending[role] = count;
    // Первую загрузку не озвучиваем: это не «новая» запись, а то, что уже было.
    if (previous !== undefined && count > previous) {
      playNewAppointmentSound();
    }
  }, [role, count]);
};

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
  useNewAppointmentSound("doctor", count);

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
  useNewAppointmentSound("clinic", count);

  return count ?? 0;
};
