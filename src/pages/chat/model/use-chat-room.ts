"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { chatKeys, getChatConsultations, getRoomMessages } from "@/shared/api";
import type {
  ChatConsultation,
  ChatRoom,
  IncomingSocketFrame,
} from "@/shared/api";
import { useAuthStore } from "@/shared/store";

import { CHAT_WS_BASE } from "./constants";
import type { ChatThreadMessage, ConnectionState } from "./types";

// Connection close codes defined by the backend.
const WS_CODE_INVALID_TOKEN = 4001;
const WS_CODE_NOT_A_PARTICIPANT = 4003;

// Страховка: если "перестал печатать" потеряется, снимаем статус сами.
// Больше окна дебаунса отправителя (2с) с запасом.
const TYPING_EXPIRE_MS = 6000;

const SYSTEM_APPOINTMENT_RE = /(\d{2})\.(\d{2})\.(\d{4})\s+в\s+(\d{2}):(\d{2})/;

const getConsultationKey = (date: string, time: string) =>
  `${date}|${time.slice(0, 5)}`;

const findConsultationId = (
  content: string,
  consultations: ChatConsultation[],
) => {
  const match = content.match(SYSTEM_APPOINTMENT_RE);
  if (!match) return undefined;

  const [, day, month, year, hour, minute] = match;
  const key = getConsultationKey(
    `${year}-${month}-${day}`,
    `${hour}:${minute}`,
  );
  const matches = consultations.filter(
    (consultation) =>
      getConsultationKey(consultation.date, consultation.time) === key,
  );

  return matches.reduce<number | undefined>(
    (latestId, consultation) =>
      latestId === undefined || consultation.id > latestId
        ? consultation.id
        : latestId,
    undefined,
  );
};

type UseChatRoomResult = {
  connectionState: ConnectionState;
  error: null | string;
  isLoadingHistory: boolean;
  messages: ChatThreadMessage[];
  sendMessage: (content: string) => void;
  // Сырой сигнал в сокет; дебаунс — на стороне композера.
  sendTyping: (isTyping: boolean) => void;
  // Имена участников, которые сейчас печатают (своё событие сервер не шлёт).
  typingNames: string[];
};

// Drives a single user-to-user room: loads history over HTTP, then keeps a live
// WebSocket open for incoming messages. Reconnects whenever the room changes.
export const useChatRoom = (
  roomId: null | number,
  currentUserId: null | number,
): UseChatRoomResult => {
  // The component is keyed by room id, so a fresh instance starts each room
  // already "connecting"/"loading" — no synchronous resets needed in the effect.
  const [messages, setMessages] = useState<ChatThreadMessage[]>([]);
  const [connectionState, setConnectionState] =
    useState<ConnectionState>("connecting");
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [error, setError] = useState<null | string>(null);
  // user_id → имя печатающего участника.
  const [typingUsers, setTypingUsers] = useState<Record<number, string>>({});
  const socketRef = useRef<null | WebSocket>(null);
  const consultationsRef = useRef<ChatConsultation[]>([]);
  const queryClient = useQueryClient();
  // Таймеры авто-снятия статуса по каждому user_id (на случай потери "false").
  const typingTimersRef = useRef<Record<number, ReturnType<typeof setTimeout>>>(
    {},
  );

  // Reactive token: a refresh swaps it and transparently reconnects the socket.
  const token = useAuthStore((state) => state.accessToken);
  const role = useAuthStore((state) => state.user?.role);
  const authError = token ? null : "Требуется авторизация";

  // Список переписок слева — отдельный запрос, который после отправки или
  // получения сообщения оставался таким, каким был при открытии страницы: и
  // порядок комнат, и текст последнего сообщения. Обновить его помогала
  // только перезагрузка. Поэтому свежее сообщение сразу подкладываем в кэш
  // (комната мгновенно уезжает наверх — сортировка в pages/chat/ui.tsx), а
  // потом сверяемся с сервером: он last_message пересчитывает верно.
  const touchRoom = useCallback(
    (content: string, createdAt: string) => {
      if (roomId === null) return;

      queryClient.setQueryData<ChatRoom[]>(chatKeys.rooms(), (rooms) =>
        rooms?.map((room) =>
          room.id === roomId
            ? { ...room, last_message: { content, created_at: createdAt } }
            : room,
        ),
      );
      void queryClient.invalidateQueries({ queryKey: chatKeys.rooms() });
      void queryClient.invalidateQueries({ queryKey: chatKeys.unreadCount() });
    },
    [queryClient, roomId],
  );

  useEffect(() => {
    if (roomId === null || currentUserId === null || !token || !role) return;

    let isActive = true;

    // 1. Load history (incoming unread messages are marked read server-side).
    Promise.all([
      getRoomMessages(roomId),
      getChatConsultations(role).catch(() => []),
    ])
      .then(([history, consultations]) => {
        if (!isActive) return;
        consultationsRef.current = consultations;
        setMessages(
          history.map((message) => ({
            id: message.id,
            content: message.content,
            createdAt: message.created_at,
            // sender === null — системное уведомление, ничьё.
            isMine: message.sender?.id === currentUserId,
            isRead: message.is_read,
            isSystem: message.sender === null,
            consultationId:
              message.appointment_id ??
              findConsultationId(message.content, consultations),
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
      const payload = JSON.parse(event.data as string) as IncomingSocketFrame;

      // Событие "печатает…". Своё сервер не присылает, но подстрахуемся.
      if (payload.type === "typing") {
        if (payload.user_id === currentUserId) return;
        clearTimeout(typingTimersRef.current[payload.user_id]);

        if (payload.is_typing) {
          setTypingUsers((prev) => ({
            ...prev,
            [payload.user_id]: payload.user_name,
          }));
          // Авто-снятие, если "false" не придёт.
          typingTimersRef.current[payload.user_id] = setTimeout(() => {
            setTypingUsers((prev) => {
              const next = { ...prev };
              delete next[payload.user_id];
              return next;
            });
          }, TYPING_EXPIRE_MS);
        } else {
          setTypingUsers((prev) => {
            const next = { ...prev };
            delete next[payload.user_id];
            return next;
          });
        }
        return;
      }

      const sender = payload.sender;

      // The server echoes our own messages — we already render them optimistically.
      if (sender && sender.id === currentUserId) return;

      // Пришло сообщение — собеседник закончил печатать, снимаем его статус.
      if (sender) {
        clearTimeout(typingTimersRef.current[sender.id]);
        setTypingUsers((prev) => {
          const next = { ...prev };
          delete next[sender.id];
          return next;
        });
      }

      touchRoom(payload.content, payload.created_at);

      setMessages((prev) => [
        ...prev,
        {
          id: payload.id,
          content: payload.content,
          createdAt: payload.created_at,
          isMine: false,
          // sender === null — системное уведомление (напр. онлайн-запись).
          isSystem: sender === null,
          consultationId:
            payload.appointment_id ??
            findConsultationId(payload.content, consultationsRef.current),
        },
      ]);

      // Новая запись могла появиться уже после загрузки истории комнаты.
      // Обновляем список и добавляем ссылку в только что пришедшее уведомление.
      if (sender === null && !payload.appointment_id) {
        void getChatConsultations(role)
          .then((consultations) => {
            if (!isActive) return;
            consultationsRef.current = consultations;
            const consultationId = findConsultationId(
              payload.content,
              consultations,
            );
            if (!consultationId) return;
            setMessages((prev) =>
              prev.map((message) =>
                message.id === payload.id
                  ? { ...message, consultationId }
                  : message,
              ),
            );
          })
          .catch(() => undefined);
      }
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
      consultationsRef.current = [];
      // Гасим все таймеры авто-снятия и статусы при смене комнаты/токена.
      Object.values(typingTimersRef.current).forEach(clearTimeout);
      typingTimersRef.current = {};
      setTypingUsers({});
    };
  }, [roomId, currentUserId, token, role, touchRoom]);

  const sendTyping = useCallback((isTyping: boolean) => {
    const socket = socketRef.current;
    if (!socket || socket.readyState !== WebSocket.OPEN) return;
    socket.send(JSON.stringify({ type: "typing", is_typing: isTyping }));
  }, []);

  const sendMessage = useCallback(
    (content: string) => {
      const text = content.trim();
      const socket = socketRef.current;
      if (!text || !socket || socket.readyState !== WebSocket.OPEN) return;

      // Сразу снимаем свой статус "печатает" у собеседника перед отправкой.
      sendTyping(false);

      const createdAt = new Date().toISOString();
      touchRoom(text, createdAt);

      // Optimistic render; the server's echo of this message is ignored above.
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          content: text,
          createdAt,
          isMine: true,
        },
      ]);
      socket.send(JSON.stringify({ content: text }));
    },
    [sendTyping, touchRoom],
  );

  return {
    messages,
    connectionState,
    isLoadingHistory,
    error: error ?? authError,
    sendMessage,
    typingNames: Object.values(typingUsers),
    sendTyping,
  };
};
