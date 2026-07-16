"use client";

import { FC } from "react";

import Link from "next/link";

import { useQuery } from "@tanstack/react-query";

import { chatKeys, getChatUnreadCount } from "@/shared/api";
import { ChatIcon } from "@/shared/assets/icons";
import { ROUTES } from "@/shared/config";
import { IconBtn } from "@/shared/ui";

import { useAuthDisplay } from "../lib/useAuthDisplay";

// Иконка чата в хедере с бейджем непрочитанных. Заменяет отдельный колокольчик
// уведомлений: число приходящих сообщений теперь показывается прямо на чате.
// Источник — отдельный лёгкий эндпоинт GET /api/chat/rooms/unread-count/;
// опрашиваем раз в минуту. retry: false — пока бэк не задеплоил эндпоинт, 404
// не должен спамить ретраями; при ошибке data=undefined → бейдж скрыт (0).
export const HeaderChatButton: FC = () => {
  const { isAuthed } = useAuthDisplay();

  const { data: unread = 0 } = useQuery({
    queryKey: chatKeys.unreadCount(),
    queryFn: getChatUnreadCount,
    enabled: isAuthed,
    refetchInterval: 60_000,
    retry: false,
  });

  const href = isAuthed ? ROUTES.CHATS : ROUTES.LOGIN;

  return (
    <Link href={href}>
      <IconBtn variant="outline" size="sm" aria-label="Чат">
        <span className="relative">
          <ChatIcon className="size-5" />
          {unread > 0 && (
            <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-0.5 rounded-full bg-primary text-white text-[10px] font-semibold flex items-center justify-center">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </span>
      </IconBtn>
    </Link>
  );
};
