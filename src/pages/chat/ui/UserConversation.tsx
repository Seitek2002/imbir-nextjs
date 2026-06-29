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
  const { messages, connectionState, isLoadingHistory, error, sendMessage } =
    useChatRoom(roomId, currentUserId);
  const isOpen = connectionState === "open";

  return (
    <>
      <ChatHeader
        name={name}
        isAi={false}
        onBack={onBack}
        subtitle={
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
        }
      />
      <MessageThread
        messages={messages}
        isLoading={isLoadingHistory}
        error={error}
        emptyHint="Сообщений пока нет. Начните общение!"
      />
      <MessageComposer onSend={sendMessage} disabled={!isOpen} />
    </>
  );
};
