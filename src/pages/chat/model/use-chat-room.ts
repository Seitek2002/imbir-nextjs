"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getRoomMessages } from "@/shared/api";
import type { IncomingChatMessage } from "@/shared/api";
import { useAuthStore } from "@/shared/store";

import { CHAT_WS_BASE } from "./constants";
import type { ChatThreadMessage, ConnectionState } from "./types";

// Connection close codes defined by the backend.
const WS_CODE_INVALID_TOKEN = 4001;
const WS_CODE_NOT_A_PARTICIPANT = 4003;

type UseChatRoomResult = {
  messages: ChatThreadMessage[];
  connectionState: ConnectionState;
  isLoadingHistory: boolean;
  error: string | null;
  sendMessage: (content: string) => void;
};

// Drives a single user-to-user room: loads history over HTTP, then keeps a live
// WebSocket open for incoming messages. Reconnects whenever the room changes.
export const useChatRoom = (
  roomId: number | null,
  currentUserId: number | null,
): UseChatRoomResult => {
  // The component is keyed by room id, so a fresh instance starts each room
  // already "connecting"/"loading" — no synchronous resets needed in the effect.
  const [messages, setMessages] = useState<ChatThreadMessage[]>([]);
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("connecting");
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  // Reactive token: a refresh swaps it and transparently reconnects the socket.
  const token = useAuthStore((state) => state.accessToken);
  const authError = token ? null : "Требуется авторизация";

  useEffect(() => {
    if (roomId === null || currentUserId === null || !token) return;

    let isActive = true;

    // 1. Load history (incoming unread messages are marked read server-side).
    getRoomMessages(roomId)
      .then((history) => {
        if (!isActive) return;
        setMessages(
          history.map((message) => ({
            id: message.id,
            content: message.content,
            createdAt: message.created_at,
            isMine: message.sender.id === currentUserId,
            isRead: message.is_read,
          })),
        );
      })
      .catch(() => {
        if (isActive) setError("Не удалось загрузить историю сообщений");
      })
      .finally(() => {
        if (isActive) setIsLoadingHistory(false);
      });

    // 2. Open the authenticated socket — the token goes in the query string.
    const socket = new WebSocket(
      `${CHAT_WS_BASE}/ws/chat/${roomId}/?token=${token}`,
    );
    socketRef.current = socket;

    socket.onopen = () => {
      if (!isActive) return;
      setConnectionState("open");
      setError(null); // Clear any stale "reconnecting" error after a refresh.
    };

    socket.onmessage = (event) => {
      if (!isActive) return;
      const payload = JSON.parse(event.data as string) as IncomingChatMessage;

      // The server echoes our own messages — we already render them optimistically.
      if (payload.sender.id === currentUserId) return;

      setMessages((prev) => [
        ...prev,
        {
          id: payload.id,
          content: payload.content,
          createdAt: payload.created_at,
          isMine: false,
        },
      ]);
    };

    socket.onerror = () => {
      if (isActive) setConnectionState("error");
    };

    socket.onclose = (event) => {
      if (!isActive) return;
      setConnectionState("closed");
      if (event.code === WS_CODE_INVALID_TOKEN) {
        setError("Сессия истекла. Войдите снова.");
      } else if (event.code === WS_CODE_NOT_A_PARTICIPANT) {
        setError("Нет доступа к этому чату");
      }
    };

    return () => {
      isActive = false;
      socket.close();
      socketRef.current = null;
    };
  }, [roomId, currentUserId, token]);

  const sendMessage = useCallback((content: string) => {
    const text = content.trim();
    const socket = socketRef.current;
    if (!text || !socket || socket.readyState !== WebSocket.OPEN) return;

    // Optimistic render; the server's echo of this message is ignored above.
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        content: text,
        createdAt: new Date().toISOString(),
        isMine: true,
      },
    ]);
    socket.send(JSON.stringify({ content: text }));
  }, []);

  return {
    messages,
    connectionState,
    isLoadingHistory,
    error: error ?? authError,
    sendMessage,
  };
};
