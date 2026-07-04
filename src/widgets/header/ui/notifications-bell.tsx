"use client";

import { FC, useEffect, useRef, useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  notificationKeys,
} from "@/shared/api";
import { useAuthStore } from "@/shared/store";
import { IconBtn } from "@/shared/ui";

const BellIcon: FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none">
    <path
      d="M15 6.66667C15 5.34058 14.4732 4.06881 13.5355 3.13113C12.5979 2.19345 11.3261 1.66667 10 1.66667C8.67392 1.66667 7.40215 2.19345 6.46447 3.13113C5.52678 4.06881 5 5.34058 5 6.66667C5 12.5 2.5 14.1667 2.5 14.1667H17.5C17.5 14.1667 15 12.5 15 6.66667Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11.4417 17.5C11.2952 17.7526 11.0849 17.9622 10.8319 18.1079C10.5789 18.2537 10.292 18.3304 10 18.3304C9.70802 18.3304 9.42115 18.2537 9.16814 18.1079C8.91513 17.9622 8.70484 17.7526 8.55833 17.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const formatWhen = (iso: string) =>
  new Date(iso).toLocaleString("ru-RU", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

// Колокол уведомлений: бейдж непрочитанных + дропдаун со списком.
// Показывается только авторизованным; список опрашивается раз в минуту.
export const NotificationsBell: FC = () => {
  const isAuthed = useAuthStore((s) => Boolean(s.accessToken));
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: notificationKeys.list(),
    queryFn: getNotifications,
    enabled: isAuthed,
    refetchInterval: 60_000,
  });

  const { mutate: readOne } = useMutation({
    mutationFn: (id: number) => markNotificationRead(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  });

  const { mutate: readAll } = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  });

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  if (!isAuthed) return null;

  const notifications = data?.data ?? [];
  const unread = data?.unread_count ?? 0;

  return (
    <div ref={rootRef} className="relative">
      <IconBtn
        variant="outline"
        size="sm"
        onClick={() => setIsOpen((v) => !v)}
        aria-label="Уведомления"
      >
        <span className="relative">
          <BellIcon className="size-5" />
          {unread > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-0.5 rounded-full bg-primary text-white text-[10px] font-semibold flex items-center justify-center">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </span>
      </IconBtn>

      {isOpen && (
        <div className="absolute right-0 top-12 w-80 max-h-96 overflow-y-auto bg-white rounded-2xl border border-border shadow-[0_12px_40px_rgba(0,0,0,0.08)] z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-semibold text-foreground">
              Уведомления
            </span>
            {unread > 0 && (
              <button
                onClick={() => readAll()}
                className="text-xs text-primary hover:underline"
              >
                Прочитать все
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="px-4 py-8 text-center text-muted text-sm">
              Уведомлений пока нет
            </p>
          ) : (
            notifications.map((n) => (
              <button
                key={n.id}
                onClick={() => {
                  if (!n.is_read) readOne(n.id);
                }}
                className={`w-full text-left px-4 py-3 border-b border-background last:border-0 hover:bg-surface transition-colors ${
                  n.is_read ? "" : "bg-primary-tint/40"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">
                    {n.title}
                  </p>
                  {!n.is_read && (
                    <span className="size-2 rounded-full bg-primary shrink-0 mt-1.5" />
                  )}
                </div>
                {n.body && (
                  <p className="text-xs text-secondary mt-0.5 line-clamp-2">
                    {n.body}
                  </p>
                )}
                <p className="text-[11px] text-muted mt-1">
                  {formatWhen(n.created_at)}
                </p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};
