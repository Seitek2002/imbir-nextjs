"use client";

import { FC, useRef, useState } from "react";
import toast from "react-hot-toast";

import { uploadFile } from "@/shared/api";
import { toMediaUrl } from "@/shared/lib/media";
import { useAuthStore } from "@/shared/store";

import type { ConnectionState } from "../model/types";
import { useChatRoom } from "../model/use-chat-room";
import { ChatHeader } from "./ChatHeader";
import { ConsultationSummaryModal } from "./ConsultationSummaryModal";
import { MessageComposer, type MessageComposerHandle } from "./MessageComposer";
import { MessageThread } from "./MessageThread";

// Состояние СВОЕГО сокета этой вкладки, а не присутствие собеседника: бэк
// присутствие не отслеживает. Раньше под именем собеседника горело «В сети»
// при открытом своём сокете, и пациент ждал быстрого ответа от врача, который
// не заходил неделю. Поэтому при открытом соединении подпись не выводим, а
// проблемы со связью подписываем так, чтобы они читались как свои.
const CONNECTION_LABEL: Record<ConnectionState, null | string> = {
  connecting: "Подключение…",
  open: null,
  closed: "Нет соединения",
  error: "Ошибка соединения",
};

// "Иван печатает…" / "Иван и Мария печатают…" / "…и ещё N печатают…"
const typingLabel = (names: string[]): null | string => {
  if (names.length === 0) return null;
  if (names.length === 1) return `${names[0]} печатает…`;
  if (names.length === 2) return `${names[0]} и ${names[1]} печатают…`;
  return `${names[0]}, ${names[1]} и ещё ${names.length - 2} печатают…`;
};

// Вне компонента: React Compiler не поддерживает `??` внутри try и из-за
// этой строки пропускал весь UserConversation. Тогда обработчики ленты
// пересоздавались на каждое сообщение и заново рисовалась вся переписка.
const uploadChatFile = async (file: File): Promise<string> => {
  const { url } = await uploadFile(file);
  return toMediaUrl(url) ?? url;
};

type Props = {
  currentUserId: number;
  name: string;
  onBack: () => void;
  // ID собеседника. Нужен для итогов созвонов: записи отбираются по нему.
  partnerId?: number;
  roomId: number;
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
    editMessage,
    deleteMessages,
    typingNames,
    sendTyping,
  } = useChatRoom(roomId, currentUserId);
  const isOpen = connectionState === "open";
  const typing = typingLabel(typingNames);
  const connectionLabel = CONNECTION_LABEL[connectionState];

  const role = useAuthStore((state) => state.user?.role);
  const [showSummaries, setShowSummaries] = useState(false);
  // Итоги есть только у сторон приёма. Для клиники LiveKit-комнат нет
  // (см. getChatConsultations), поэтому кнопку ей не показываем.
  const canSeeSummaries =
    !!partnerId && (role === "doctor" || role === "patient");
  const composerRef = useRef<MessageComposerHandle>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedMessageIds, setSelectedMessageIds] = useState<number[]>([]);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const editingMessage = messages.find(
    (message) => message.id === editingMessageId,
  );

  const handleSelectMessage = (message: (typeof messages)[number]) => {
    if (!message.isMine || message.isDeleted) return;
    setSelectedMessageIds((current) =>
      current.includes(message.id)
        ? current.filter((id) => id !== message.id)
        : [...current, message.id],
    );
  };

  const handleDeleteMessages = (messageIds: number[]) => {
    if (!messageIds.length) return;
    const confirmed = window.confirm(
      messageIds.length === 1
        ? "Удалить это сообщение?"
        : `Удалить выбранные сообщения (${messageIds.length})?`,
    );
    if (!confirmed) return;
    deleteMessages(messageIds);
    setSelectedMessageIds([]);
    setEditingMessageId(null);
  };

  const handleEditMessage = (message: (typeof messages)[number]) => {
    if (!message.isMine || message.isDeleted) return;
    setSelectedMessageIds([]);
    setEditingMessageId(message.id);
  };

  const sendFiles = async (files: File[]): Promise<File[]> => {
    const failedFiles: File[] = [];

    for (const file of files) {
      try {
        const fileUrl = await uploadChatFile(file);
        sendMessage(`${file.name}\n${fileUrl}`);
      } catch {
        failedFiles.push(file);
      }
    }

    if (failedFiles.length > 0) {
      toast.error("Не удалось отправить некоторые файлы");
    }

    return failedFiles;
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    if (!Array.from(event.dataTransfer.types).includes("Files")) return;
    event.preventDefault();
    if (isOpen) setIsDragActive(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsDragActive(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragActive(false);
    if (!isOpen) return;
    composerRef.current?.addFiles(Array.from(event.dataTransfer.files));
  };

  return (
    <div
      className="relative flex min-h-0 flex-1 flex-col"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDragActive && (
        <div className="pointer-events-none absolute inset-2 z-10 flex items-center justify-center rounded-3xl border-2 border-dashed border-primary bg-white/95 text-sm font-medium text-primary">
          Перетащите файл сюда
        </div>
      )}
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
          ) : connectionLabel ? (
            <span className="text-muted">{connectionLabel}</span>
          ) : undefined
        }
      />
      <MessageThread
        messages={messages}
        isLoading={isLoadingHistory}
        error={error}
        pendingReply={typingNames.length > 0}
        emptyHint="Сообщений пока нет. Начните общение!"
        onDeleteMessages={handleDeleteMessages}
        onEditMessage={handleEditMessage}
        selectedMessageIds={selectedMessageIds}
        onSelectMessage={handleSelectMessage}
        onClearSelection={() => setSelectedMessageIds([])}
      />
      <MessageComposer
        ref={composerRef}
        onSend={sendMessage}
        onSendFiles={sendFiles}
        onTyping={sendTyping}
        disabled={!isOpen}
        editingText={editingMessage?.content ?? null}
        onEdit={(text) => {
          if (editingMessageId !== null) editMessage(editingMessageId, text);
          setEditingMessageId(null);
        }}
        onCancelEdit={() => setEditingMessageId(null)}
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
    </div>
  );
};
