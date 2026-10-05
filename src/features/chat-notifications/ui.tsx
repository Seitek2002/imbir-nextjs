"use client";

import { FC } from "react";

import { useQuery } from "@tanstack/react-query";

import { chatKeys, getChatUnreadCount } from "@/shared/api";
import { ROUTES } from "@/shared/config";
import { useSoundOnIncrease } from "@/shared/lib/notificationSound";
import { useAuthStore } from "@/shared/store";

// Счётчик непрочитанных опрашивается и для бейджа в шапке, и для звука, поэтому
// один таймер на всё приложение. 30 секунд — как обновление списка чатов.
const CHAT_POLL_MS = 30_000;

// На самой странице чата сообщение и так видно: звук там лишний.
const isOnChatPage = () => window.location.pathname.startsWith(ROUTES.CHATS);

// Монтируется один раз в провайдерах и ничего не рисует. Нужен отдельно от
// шапки: на телефоне шапка без бейджа чата, а звук должен играть всё равно.
export const ChatMessageSoundWatcher: FC = () => {
  const isAuthed = useAuthStore((s) => Boolean(s.accessToken));

  const { data } = useQuery({
    queryKey: chatKeys.unreadCount(),
    queryFn: getChatUnreadCount,
    enabled: isAuthed,
    refetchInterval: CHAT_POLL_MS,
    retry: false,
  });

  useSoundOnIncrease("chat", isAuthed ? data : undefined, isOnChatPage);

  return null;
};
