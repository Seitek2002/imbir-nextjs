"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { clearAiChat, getAiChatHistory, sendAiMessage } from "@/shared/api";
import type { AiChatMessage } from "@/shared/api";

import type { ChatThreadMessage } from "./types";

const toThreadMessage = (message: AiChatMessage): ChatThreadMessage => ({
  id: message.id,
  content: message.content,
  createdAt: message.created_at,
  isMine: message.role === "user",
  recommendations: message.recommendations,
});

type UseAiChatResult = {
  clearHistory: () => Promise<void>;
  error: null | string;
  isLoadingHistory: boolean;
  isSending: boolean;
  messages: ChatThreadMessage[];
  sendMessage: (content: string) => Promise<void>;
};

// Drives the AI assistant ("room 0"). Plain request/response over HTTP — no
// socket. Sending can take several seconds, hence the explicit `isSending` flag.
// `initialMessage` (e.g. a symptom typed on the home hero) is sent once, after
// history has loaded; `onAutoSent` lets the caller drop it so it isn't resent.
export const useAiChat = (
  initialMessage?: string,
  onAutoSent?: () => void,
): UseAiChatResult => {
  const [messages, setMessages] = useState<ChatThreadMessage[]>([]);
  // Starts loading on mount; setState stays inside the async callbacks below.
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<null | string>(null);
  const autoSentRef = useRef(false);

  useEffect(() => {
    let isActive = true;

    getAiChatHistory()
      .then((history) => {
        if (isActive) setMessages(history.map(toThreadMessage));
      })
      .catch(() => {
        if (isActive) setError("Не удалось загрузить историю");
      })
      .finally(() => {
        if (isActive) setIsLoadingHistory(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    const text = content.trim();
    if (!text) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        content: text,
        createdAt: new Date().toISOString(),
        isMine: true,
      },
    ]);
    setIsSending(true);
    setError(null);

    try {
      const reply = await sendAiMessage({ message: text });
      // isFresh — только здесь: этот ответ пришёл на глазах у пользователя,
      // и лента проявит его анимацией. История такой пометки не получает.
      setMessages((prev) => [
        ...prev,
        { ...toThreadMessage(reply), isFresh: true },
      ]);
    } catch {
      setError("ИИ-помощник недоступен. Попробуйте позже.");
    } finally {
      setIsSending(false);
    }
  }, []);

  // Fire the handed-in message once, after history finished loading so it lands
  // at the bottom of the thread.
  useEffect(() => {
    if (autoSentRef.current || isLoadingHistory || !initialMessage) return;
    autoSentRef.current = true;
    sendMessage(initialMessage);
    onAutoSent?.();
  }, [isLoadingHistory, initialMessage, sendMessage, onAutoSent]);

  const clearHistory = useCallback(async () => {
    setError(null);
    try {
      await clearAiChat();
      setMessages([]);
    } catch {
      setError("Не удалось очистить историю");
    }
  }, []);

  return {
    messages,
    isLoadingHistory,
    isSending,
    error,
    sendMessage,
    clearHistory,
  };
};
