"use client";

import { useCallback, useEffect, useState } from "react";

import { clearAiChat, getAiChatHistory, sendAiMessage } from "@/shared/api";
import type { AiChatMessage } from "@/shared/api";

import type { ChatThreadMessage } from "./types";

const toThreadMessage = (message: AiChatMessage): ChatThreadMessage => ({
  id: message.id,
  content: message.content,
  createdAt: message.created_at,
  isMine: message.role === "user",
});

type UseAiChatResult = {
  messages: ChatThreadMessage[];
  isLoadingHistory: boolean;
  isSending: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearHistory: () => Promise<void>;
};

// Drives the AI assistant ("room 0"). Plain request/response over HTTP — no
// socket. Sending can take several seconds, hence the explicit `isSending` flag.
export const useAiChat = (): UseAiChatResult => {
  const [messages, setMessages] = useState<ChatThreadMessage[]>([]);
  // Starts loading on mount; setState stays inside the async callbacks below.
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setMessages((prev) => [...prev, toThreadMessage(reply)]);
    } catch {
      setError("ИИ-помощник недоступен. Попробуйте позже.");
    } finally {
      setIsSending(false);
    }
  }, []);

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
