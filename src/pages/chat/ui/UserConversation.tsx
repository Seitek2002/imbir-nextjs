"use client";

import { FC, useState } from "react";

import { cn } from "@/shared/lib/utils";
import { useAuthStore } from "@/shared/store";

import type { ConnectionState } from "../model/types";
import { useChatRoom } from "../model/use-chat-room";
import { ChatHeader } from "./ChatHeader";
import { ConsultationSummaryModal } from "./ConsultationSummaryModal";
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
  // ID собеседника. Нужен для итогов созвонов: записи отбираются по нему.
  partnerId?: number;
  onBack: () => void;
};

export const UserConversation: FC<Props> = ({
  roomId,
  name,
  currentUserId,
  partnerId,
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

  const role = useAuthStore((state) => state.user?.role);
  const [showSummaries, setShowSummaries] = useState(false);
  // Итоги есть только у сторон приёма. Для клиники LiveKit-комнат нет
  // (см. getChatConsultations), поэтому кнопку ей не показываем.
  const canSeeSummaries =
    !!partnerId && (role === "doctor" || role === "patient");

  return (
    <>
      <ChatHeader
        name={name}
        isAi={false}
        onBack={onBack}
        onOpenSummaries={
          canSeeSummaries ? () => setShowSummaries(true) : undefined
        }
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

      {canSeeSummaries && (
        <ConsultationSummaryModal
          isOpen={showSummaries}
          onClose={() => setShowSummaries(false)}
          role={role === "doctor" ? "doctor" : "patient"}
          partnerUserId={partnerId!}
          partnerName={name}
          // Отправлять ссылку пациенту может только врач, и только пока
          // сокет открыт — иначе сообщение молча потеряется.
          onShare={role === "doctor" && isOpen ? sendMessage : undefined}
        />
      )}
    </>
  );
};
