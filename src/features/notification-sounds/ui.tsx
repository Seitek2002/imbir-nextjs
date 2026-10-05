"use client";

import { FC } from "react";

import { cn } from "@/shared/lib/utils";
import {
  type NotificationSoundKind,
  useNotificationSettingsStore,
} from "@/shared/store";

const ROWS: Record<NotificationSoundKind, { hint: string; label: string }> = {
  appointment: {
    label: "Новые записи",
    hint: "Когда пациент записался и ждёт подтверждения",
  },
  chat: {
    label: "Сообщения в чате",
    hint: "Когда приходит новое сообщение",
  },
};

type Props = {
  // Какие типы показывать: пациенту не нужен звук записей, врачу и клинике — нужен.
  kinds: NotificationSoundKind[];
};

// Переключатели звуков уведомлений. Выбор хранится на этом устройстве.
export const NotificationSoundSettings: FC<Props> = ({ kinds }) => {
  const sounds = useNotificationSettingsStore((s) => s.sounds);
  const setSound = useNotificationSettingsStore((s) => s.setSound);

  return (
    <section className="bg-white rounded-3xl border border-border p-5 md:p-6">
      <h2 className="text-lg font-semibold text-foreground">
        Звуки уведомлений
      </h2>
      <p className="text-muted text-sm mt-1">
        Настройка действует только на этом устройстве.
      </p>

      <div className="mt-4 flex flex-col">
        {kinds.map((kind) => {
          const { label, hint } = ROWS[kind];
          const on = sounds[kind];
          return (
            <div
              key={kind}
              className="flex items-center justify-between gap-4 py-3 border-b border-background last:border-b-0"
            >
              <div className="min-w-0">
                <p className="text-foreground font-medium">{label}</p>
                <p className="text-muted text-sm">{hint}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-label={`Звук: ${label}`}
                onClick={() => setSound(kind, !on)}
                className={cn(
                  "relative w-11 h-6 rounded-full transition-colors shrink-0",
                  on ? "bg-primary" : "bg-border-soft",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 size-5 rounded-full bg-white shadow-sm transition-all duration-200 ease-out",
                    on ? "left-[22px]" : "left-0.5",
                  )}
                />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};
