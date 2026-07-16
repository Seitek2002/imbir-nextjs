"use client";

import { FC } from "react";

import Link from "next/link";

import { useQuery } from "@tanstack/react-query";

import { chatKeys, getChatRooms } from "@/shared/api";
import { ChatIcon } from "@/shared/assets/icons";
import { ROUTES } from "@/shared/config";
import { IconBtn } from "@/shared/ui";

import { useAuthDisplay } from "../lib/useAuthDisplay";

// Иконка чата в хедере с бейджем непрочитанных. Заменяет отдельный колокольчик
// уведомлений: число приходящих сообщений теперь показывается прямо на чате.
// Источник числа — unread_count по комнатам (getChatRooms); опрашиваем раз в
// минуту, как раньше делал колокол. Пока бэк не отдаёт unread_count — сумма 0
// и бейдж не рисуется.
export const HeaderChatButton: FC = () => {
  const { isAuthed } = useAuthDisplay();

  const { data: rooms } = useQuery({
    queryKey: chatKeys.rooms(),
    queryFn: getChatRooms,
    enabled: isAuthed,
    refetchInterval: 60_000,
  });

  const unread = (rooms ?? []).reduce(
    (sum, room) => sum + (room.unread_count ?? 0),
    0,
  );

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
