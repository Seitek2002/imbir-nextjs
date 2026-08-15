"use client";

import { FC } from "react";

import { AI_ASSISTANT_NAME } from "../model/constants";
import { useAiChat } from "../model/use-ai-chat";
import { ChatHeader } from "./ChatHeader";
import { MessageComposer } from "./MessageComposer";
import { MessageThread } from "./MessageThread";

type Props = {
  onBack: () => void;
  initialMessage?: string;
  onInitialSent?: () => void;
};

export const AiConversation: FC<Props> = ({
  onBack,
  initialMessage,
  onInitialSent,
}) => {
  const {
    messages,
    isLoadingHistory,
    isSending,
    error,
    sendMessage,
    clearHistory,
  } = useAiChat(initialMessage, onInitialSent);

  return (
    <>
      <ChatHeader
        name={AI_ASSISTANT_NAME}
        isAi
        onBack={onBack}
        onClear={messages.length > 0 ? clearHistory : undefined}
        subtitle={<span className="text-muted">Виртуальный ассистент</span>}
      />
      <MessageThread
        messages={messages}
        isLoading={isLoadingHistory}
        error={error}
        pendingReply={isSending}
        emptyHint="Опишите симптомы — ассистент подскажет, что делать."
      />
      <MessageComposer
        onSend={sendMessage}
        disabled={isSending}
        placeholder="Спросите ИИ-помощника"
        disclaimer="Это ИИ, он может ошибаться. ИИ не врач — он может только проконсультировать или помочь направить к врачу."
      />
    </>
  );
};
