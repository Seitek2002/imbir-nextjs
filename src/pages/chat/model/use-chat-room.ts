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

// Переподключение после обрыва сокета: 1с, 2с, 4с… но не реже раза в 30с.
const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 30_000;

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
  deleteMessages: (messageIds: number[]) => void;
  editMessage: (messageId: number, content: string) => void;
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
  const optimisticIdRef = useRef(0);
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

  // Последний снимок ленты для обработчика сокета: он живёт дольше рендера и
  // иначе видел бы сообщения только на момент подключения.
  const messagesRef = useRef<ChatThreadMessage[]>([]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    if (roomId === null || currentUserId === null || !token || !role) return;

    let isActive = true;
    let socket: null | WebSocket = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
    let reconnectAttempt = 0;
    // Входящее пришло, пока вкладка была скрыта: прочитанным пометим, когда
    // пользователь к ней вернётся.
    let hasUnseenIncoming = false;

    // Прочитали входящие (GET истории или кадр "read") — бейджи у комнаты и в
    // шапке пересчитываются сервером.
    const refreshUnread = () => {
      void queryClient.invalidateQueries({ queryKey: chatKeys.rooms() });
      void queryClient.invalidateQueries({ queryKey: chatKeys.unreadCount() });
    };

    // 1. Load history (incoming unread messages are marked read server-side).
    // Повторяется после переподключения: догружает то, что пришло без сокета.
    const loadHistory = () =>
      Promise.all([
        getRoomMessages(roomId),
        getChatConsultations(role).catch(() => []),
      ])
        .then(([history, consultations]) => {
          if (!isActive) return;
          consultationsRef.current = consultations;
          const loaded: ChatThreadMessage[] = history.map((message) => ({
            id: message.id,
            content: message.content,
            createdAt: message.created_at,
            editedAt: message.edited_at,
            // sender === null — системное уведомление, ничьё.
            isMine: message.sender?.id === currentUserId,
            isRead: message.is_read,
            isDeleted: message.is_deleted,
            isSystem: message.sender === null,
            consultationId:
              message.appointment_id ??
              findConsultationId(message.content, consultations),
          }));
          setMessages((prev) => {
            // Пришедшие по сокету, пока шёл запрос истории, в ответ могли не
            // попасть — не теряем их.
            const loadedIds = new Set(loaded.map((message) => message.id));
            const arrived = prev.filter(
              (message) => message.id > 0 && !loadedIds.has(message.id),
            );
            // Отправленные до обрыва, но не подтверждённые сервером сообщения
            // не теряем, если их нет в загруженной истории.
            const ownContents = new Set(
              loaded
                .filter((message) => message.isMine)
                .map((message) => message.content),
            );
            const pending = prev.filter(
              (message) => message.id < 0 && !ownContents.has(message.content),
            );
            return [...loaded, ...arrived, ...pending];
          });
          refreshUnread();
        })
        .catch(() => {
          if (isActive) setError("Не удалось загрузить историю сообщений");
        })
        .finally(() => {
          if (isActive) setIsLoadingHistory(false);
        });

    const sendRead = () => {
      if (document.visibilityState === "hidden") {
        hasUnseenIncoming = true;
        return;
      }
      hasUnseenIncoming = false;
      if (socket?.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: "read" }));
      }
    };

    const handleVisibilityChange = () => {
      if (hasUnseenIncoming && document.visibilityState === "visible") {
        sendRead();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    void loadHistory();

    const handleFrame = (event: MessageEvent) => {
      if (!isActive) return;
      const payload = JSON.parse(event.data as string) as IncomingSocketFrame;

      // Кто-то прочитал сообщения комнаты.
      if (payload.type === "messages_read") {
        // Это мы (здесь или на другом устройстве) — обновляем счётчики.
        if (payload.reader_id === currentUserId) {
          refreshUnread();
          return;
        }
        // Собеседник прочитал наши сообщения — галочки становятся зелёными.
        const readIds = new Set(payload.message_ids);
        setMessages((prev) =>
          prev.map((message) =>
            message.isMine && !message.isRead && readIds.has(message.id)
              ? { ...message, isRead: true }
              : message,
          ),
        );
        return;
      }

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

      if (payload.type === "message_edited") {
        setMessages((prev) =>
          prev.map((message) =>
            message.id === payload.id
              ? {
                  ...message,
                  content: payload.content,
                  editedAt: payload.edited_at,
                }
              : message,
          ),
        );
        return;
      }

      if (payload.type === "messages_deleted") {
        const deletedIds = new Set(payload.message_ids);
        setMessages((prev) =>
          prev.map((message) =>
            deletedIds.has(message.id)
              ? { ...message, content: "", isDeleted: true }
              : message,
          ),
        );
        return;
      }

      const sender = payload.sender;

      // Сопоставляем echo с optimistic-сообщением, чтобы сразу получить настоящий
      // id и затем иметь возможность редактировать/удалять его без перезагрузки.
      if (sender && sender.id === currentUserId) {
        const isPendingHere = messagesRef.current.some(
          (message) =>
            message.isMine &&
            message.id < 0 &&
            message.content === payload.content,
        );
        // Отправлено с другого устройства/вкладки — список комнат тоже свежий.
        if (!isPendingHere) touchRoom(payload.content, payload.created_at);

        setMessages((prev) => {
          if (prev.some((message) => message.id === payload.id)) return prev;
          const optimisticIndex = [...prev]
            .map((message, index) => ({ message, index }))
            .reverse()
            .find(
              ({ message }) =>
                message.isMine &&
                message.id < 0 &&
                message.content === payload.content,
            )?.index;
          // Своего optimistic-сообщения нет — значит, оно отправлено с
          // другого устройства: показываем его как своё.
          if (optimisticIndex === undefined) {
            return [
              ...prev,
              {
                id: payload.id,
                content: payload.content,
                createdAt: payload.created_at,
                editedAt: payload.edited_at,
                isMine: true,
                isRead: payload.is_read ?? false,
              },
            ];
          }
          const next = [...prev];
          next[optimisticIndex] = {
            ...next[optimisticIndex],
            id: payload.id,
            createdAt: payload.created_at,
            // Старый бэк is_read в кадре не шлёт — оставляем серую галочку.
            isRead: payload.is_read ?? next[optimisticIndex].isRead,
          };
          return next;
        });
        return;
      }

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
          editedAt: payload.edited_at,
          isMine: false,
          // sender === null — системное уведомление (напр. онлайн-запись).
          isSystem: sender === null,
          consultationId:
            payload.appointment_id ??
            findConsultationId(payload.content, consultationsRef.current),
        },
      ]);

      // Комната открыта — входящее сразу прочитано. Без этого оно оставалось
      // непрочитанным на сервере и счётчик в шапке рос, пока чат открыт.
      sendRead();

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

    // 2. Open the authenticated socket — the token goes in the query string.
    const connect = () => {
      // receipts=1 — просим кадры "messages_read" (старым клиентам бэк их не шлёт).
      const ws = new WebSocket(
        `${CHAT_WS_BASE}/ws/chat/${roomId}/?token=${token}&receipts=1`,
      );
      socket = ws;
      socketRef.current = ws;

      ws.onopen = () => {
        if (!isActive) return;
        setConnectionState("open");
        setError(null); // Clear any stale "reconnecting" error after a refresh.
        // Переподключились — пока сокета не было, могли прийти сообщения.
        if (reconnectAttempt > 0) void loadHistory();
        reconnectAttempt = 0;
      };

      ws.onmessage = handleFrame;

      ws.onerror = () => {
        if (isActive) setConnectionState("error");
      };

      ws.onclose = (event) => {
        if (!isActive) return;
        if (event.code === WS_CODE_INVALID_TOKEN) {
          // Переподключится сам эффект, когда обновится токен.
          setConnectionState("closed");
          setError("Сессия истекла. Войдите снова.");
          return;
        }
        if (event.code === WS_CODE_NOT_A_PARTICIPANT) {
          setConnectionState("closed");
          setError("Нет доступа к этому чату");
          return;
        }
        // Обрыв сети, сон устройства, рестарт сервера — раньше сокет так и
        // оставался закрытым до перезагрузки. Переподключаемся с паузой.
        setConnectionState("connecting");
        const delay = Math.min(
          RECONNECT_BASE_MS * 2 ** reconnectAttempt,
          RECONNECT_MAX_MS,
        );
        reconnectAttempt += 1;
        reconnectTimer = setTimeout(() => {
          if (isActive) connect();
        }, delay);
      };
    };

    connect();

    return () => {
      isActive = false;
      clearTimeout(reconnectTimer);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      socket?.close();
      socketRef.current = null;
      consultationsRef.current = [];
      // Гасим все таймеры авто-снятия и статусы при смене комнаты/токена.
      Object.values(typingTimersRef.current).forEach(clearTimeout);
      typingTimersRef.current = {};
      setTypingUsers({});
    };
  }, [roomId, currentUserId, token, role, touchRoom, queryClient]);

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
          id: -++optimisticIdRef.current,
          content: text,
          createdAt,
          isMine: true,
          // Серая галочка сразу; зелёной станет по кадру "messages_read".
          isRead: false,
        },
      ]);
      socket.send(JSON.stringify({ content: text }));
    },
    [sendTyping, touchRoom],
  );

  const editMessage = useCallback((messageId: number, content: string) => {
    const text = content.trim();
    const socket = socketRef.current;
    if (!text || !socket || socket.readyState !== WebSocket.OPEN) return;
    setMessages((prev) =>
      prev.map((message) =>
        message.id === messageId
          ? { ...message, content: text, editedAt: new Date().toISOString() }
          : message,
      ),
    );
    socket.send(
      JSON.stringify({ type: "edit", message_id: messageId, content: text }),
    );
  }, []);

  const deleteMessages = useCallback((messageIds: number[]) => {
    const socket = socketRef.current;
    if (!messageIds.length || !socket || socket.readyState !== WebSocket.OPEN)
      return;
    const ids = new Set(messageIds);
    setMessages((prev) =>
      prev.map((message) =>
        ids.has(message.id)
          ? { ...message, content: "", isDeleted: true }
          : message,
      ),
    );
    socket.send(JSON.stringify({ type: "delete", message_ids: messageIds }));
  }, []);

  return {
    messages,
    connectionState,
    isLoadingHistory,
    error: error ?? authError,
    deleteMessages,
    editMessage,
    sendMessage,
    typingNames: Object.values(typingUsers),
    sendTyping,
  };
};
