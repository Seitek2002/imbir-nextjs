"use client";

import { FC, useEffect, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  type Notification,
  getNotifications,
  getNotificationsUnreadCount,
  markAllNotificationsRead,
  markNotificationRead,
  notificationKeys,
} from "@/shared/api";
import { ROUTES } from "@/shared/config";
import { IconBtn } from "@/shared/ui";

// Бейдж опрашиваем раз в минуту — как счётчик новых записей в кабинете.
const POLL_MS = 60_000;

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

// Куда ведёт клик по уведомлению. payload на бэке фиксирован по типу
// (notifications/utils.py): запись — appointment_id, отзыв — review_id,
// чат — room_id. Отдельных страниц записи/отзыва нет, поэтому ведём в список
// своего кабинета; чат открываем сразу на нужной комнате. null — вести некуда,
// уведомление просто отмечается прочитанным.
const getNotificationHref = (
  n: Notification,
  role: string | undefined,
): null | string => {
  const payload = n.payload ?? {};

  if (n.type === "new_message" || payload.room_id) {
    return payload.room_id
      ? `${ROUTES.CHATS}?room=${payload.room_id}`
      : ROUTES.CHATS;
  }

  // «Перенос записи» приходит типом system, но с appointment_id.
  if (n.type.startsWith("appointment_") || payload.appointment_id) {
    if (role === "doctor") return "/doctor-profile/appointments";
    if (role === "clinic") return "/clinic-profile/appointments";
    return ROUTES.PROFILE_HISTORY;
  }

  if (n.type === "new_review") {
    if (role === "doctor") return "/doctor-profile/reviews";
    if (role === "clinic") return "/clinic-profile/reviews";
    return null;
  }

  if (n.type === "clinic_invite_received") return "/doctor-profile/invitations";
  if (
    n.type === "clinic_invite_accepted" ||
    n.type === "clinic_invite_declined"
  )
    return "/clinic-profile/doctor-invitations";

  return null;
};

type Props = {
  // Авторизация и роль приходят из шапки (useAuthDisplay): там они уже
  // согласованы с SSR-разметкой, и колокольчик не даёт расхождения гидратации.
  isAuthed: boolean;
  role?: string;
};

// Колокольчик in-app уведомлений: бейдж непрочитанных + выпадающий список.
// Чат здесь не дублируется по смыслу — у него свой бейдж на иконке чата, а
// колокольчик собирает всё остальное: записи, отзывы, приглашения клиник.
export const NotificationsBell: FC<Props> = ({ isAuthed, role }) => {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const router = useRouter();

  // retry: false — как у счётчика чата: при ошибке бейдж просто скрыт.
  const { data: unread = 0 } = useQuery({
    queryKey: notificationKeys.unreadCount(),
    queryFn: getNotificationsUnreadCount,
    enabled: isAuthed,
    refetchInterval: POLL_MS,
    retry: false,
  });

  // Сам список нужен только открытому дропдауну; при открытии берём свежий.
  const { data, isLoading } = useQuery({
    queryKey: notificationKeys.list(),
    queryFn: getNotifications,
    enabled: isAuthed && isOpen,
    staleTime: 0,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: notificationKeys.all });

  const { mutate: readOne } = useMutation({
    mutationFn: (id: number) => markNotificationRead(id),
    onSuccess: invalidate,
  });

  const { mutate: readAll, isPending: isReadingAll } = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: invalidate,
  });

  useEffect(() => {
    if (!isOpen) return;
    const handlePointer = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen]);

  if (!isAuthed) return null;

  const notifications = data?.data ?? [];

  const handleItemClick = (n: Notification) => {
    if (!n.is_read) readOne(n.id);
    const href = getNotificationHref(n, role);
    if (!href) return;
    setIsOpen(false);
    router.push(href);
  };

  return (
    <div ref={rootRef} className="relative">
      <IconBtn
        variant="outline"
        size="sm"
        onClick={() => setIsOpen((v) => !v)}
        aria-label="Уведомления"
        aria-expanded={isOpen}
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
        <div className="absolute right-0 top-12 w-[min(20rem,calc(100vw-2rem))] max-h-96 overflow-y-auto bg-white rounded-2xl border border-border shadow-[0_12px_40px_rgba(0,0,0,0.08)] z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-semibold text-foreground">
              Уведомления
            </span>
            {unread > 0 && (
              <button
                type="button"
                onClick={() => readAll()}
                disabled={isReadingAll}
                className="text-xs text-primary hover:underline disabled:opacity-50"
              >
                Прочитать все
              </button>
            )}
          </div>

          {isLoading ? (
            <p className="px-4 py-8 text-center text-muted text-sm">
              Загрузка...
            </p>
          ) : notifications.length === 0 ? (
            <p className="px-4 py-8 text-center text-muted text-sm">
              Уведомлений пока нет
            </p>
          ) : (
            notifications.map((n) => (
              <button
                type="button"
                key={n.id}
                onClick={() => handleItemClick(n)}
                className={`w-full text-left px-4 py-3 border-b border-background last:border-0 hover:bg-surface transition-colors ${
                  n.is_read ? "" : "bg-primary-tint/40"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">
                    {n.title}
                  </p>
                  {!n.is_read && (
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" />
                  )}
                </div>
                {n.body && (
                  <p className="mt-0.5 text-xs text-secondary line-clamp-2">
                    {n.body}
                  </p>
                )}
                <p className="mt-1 text-[11px] text-muted">
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
