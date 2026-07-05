"use client";

import { FC } from "react";

import { cn } from "@/shared/lib/utils";

import type { ConnectionState } from "../model/types";
import { useChatRoom } from "../model/use-chat-room";
import { ChatHeader } from "./ChatHeader";
import { MessageComposer } from "./MessageComposer";
import { MessageThread } from "./MessageThread";

const CONNECTION_LABEL: Record<ConnectionState, string> = {
  connecting: "Подключение...",
  open: "В сети",
  closed: "Не в сети",
  error: "Ошибка соединения",
};

// "Иван печатает…" / "Иван и Мария печатают…" / "…и ещё N печатают…"
const typingLabel = (names: string[]): string | null => {
  if (names.length === 0) return null;
  if (names.length === 1) return `${names[0]} печатает…`;
  if (names.length === 2) return `${names[0]} и ${names[1]} печатают…`;
  return `${names[0]}, ${names[1]} и ещё ${names.length - 2} печатают…`;
};

type Props = {
  roomId: number;
  name: string;
  currentUserId: number;
  onBack: () => void;
};

export const UserConversation: FC<Props> = ({
  roomId,
  name,
  currentUserId,
  onBack,
}) => {
  const {
    messages,
    connectionState,
    isLoadingHistory,
    error,
    sendMessage,
    typingNames,
    sendTyping,
  } = useChatRoom(roomId, currentUserId);
  const isOpen = connectionState === "open";
  const typing = typingLabel(typingNames);

  return (
    <>
      <ChatHeader
        name={name}
        isAi={false}
        onBack={onBack}
        subtitle={
          typing ? (
            <span className="text-primary">{typing}</span>
          ) : (
            <span
              className={cn(
                "flex items-center gap-1",
                isOpen ? "text-[#4CAF50]" : "text-muted",
              )}
            >
              {isOpen && (
                <span className="inline-block size-1.5 rounded-full bg-[#4CAF50]" />
              )}
              {CONNECTION_LABEL[connectionState]}
            </span>
          )
        }
      />
      <MessageThread
        messages={messages}
        isLoading={isLoadingHistory}
        error={error}
        pendingReply={typingNames.length > 0}
        emptyHint="Сообщений пока нет. Начните общение!"
      />
      <MessageComposer
        onSend={sendMessage}
        onTyping={sendTyping}
        disabled={!isOpen}
      />
    </>
  );
};
