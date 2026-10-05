import { create } from "zustand";
import { persist } from "zustand/middleware";

// Типы уведомлений, у которых есть свой звук. Настройка — на этом устройстве:
// выключить звук новых записей на ноутбуке не должно выключить его на телефоне.
export type NotificationSoundKind = "appointment" | "chat";

type NotificationSettingsStore = {
  setSound: (kind: NotificationSoundKind, enabled: boolean) => void;
  sounds: Record<NotificationSoundKind, boolean>;
};

export const useNotificationSettingsStore = create<NotificationSettingsStore>()(
  persist(
    (set) => ({
      setSound: (kind, enabled) =>
        set((state) => ({ sounds: { ...state.sounds, [kind]: enabled } })),
      sounds: { appointment: true, chat: true },
    }),
    { name: "notification-sounds" },
  ),
);
