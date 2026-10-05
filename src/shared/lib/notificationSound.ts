"use client";

import { useEffect } from "react";

import {
  type NotificationSoundKind,
  useNotificationSettingsStore,
} from "@/shared/store";

const SOUND_SRC: Record<NotificationSoundKind, string> = {
  appointment: "/sounds/new-appointment.wav",
  chat: "/sounds/new-message.wav",
};

const KINDS = Object.keys(SOUND_SRC) as NotificationSoundKind[];

// Один элемент на каждый тип звука, создаём при первой нужде.
const audios: Partial<Record<NotificationSoundKind, HTMLAudioElement>> = {};

// Последнее известное число по каждому типу. Несколько компонентов могут
// смотреть на один счётчик (сайдбар и мобильное меню), поэтому сравниваем с
// общим значением: звук играет один раз на изменение, а не в каждом месте.
const lastCount: Partial<Record<NotificationSoundKind, number>> = {};

let unlockRegistered = false;

const getAudio = (kind: NotificationSoundKind): HTMLAudioElement => {
  let element = audios[kind];
  if (!element) {
    element = new Audio(SOUND_SRC[kind]);
    element.preload = "auto";
    audios[kind] = element;
  }
  return element;
};

// Браузер не даст проиграть звук, пока пользователь не коснулся страницы.
// Первое касание проигрывает каждый звук беззвучно и сразу останавливает:
// после этого браузер разрешает их и без касания.
const unlockAll = () => {
  for (const kind of KINDS) {
    const element = getAudio(kind);
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
  }
};

const registerUnlock = () => {
  if (unlockRegistered || typeof document === "undefined") return;
  unlockRegistered = true;
  document.addEventListener("pointerdown", unlockAll, { once: true });
};

/** Проигрывает звук, если пользователь его не выключил. */
export const playNotificationSound = (kind: NotificationSoundKind) => {
  if (!useNotificationSettingsStore.getState().sounds[kind]) return;
  const element = getAudio(kind);
  element.currentTime = 0;
  void element.play().catch(() => {});
};

/**
 * Звук при росте счётчика. Первое значение и падение (записи подтвердили,
 * сообщения прочитали) звука не дают. `muteWhen` — функция, которая отключает
 * звук в данный момент, например на самой странице чата.
 */
export const useSoundOnIncrease = (
  kind: NotificationSoundKind,
  count: number | undefined,
  muteWhen?: () => boolean,
) => {
  useEffect(() => {
    if (count === undefined) return;
    registerUnlock();

    const previous = lastCount[kind];
    lastCount[kind] = count;
    if (previous === undefined || count <= previous) return;
    if (muteWhen?.()) return;

    playNotificationSound(kind);
  }, [kind, count, muteWhen]);
};
