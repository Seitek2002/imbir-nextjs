"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useQuery } from "@tanstack/react-query";

import { Header } from "@/widgets/header";

import {
  chatLoginFn,
  getChatMessages,
  getChatRooms,
} from "@/shared/api/chat/requests";
import { chatKeys } from "@/shared/api/queryKeys";
import {
  FilterSample,
  HeaderBackIcon,
  SearchIcon,
} from "@/shared/assets/icons";
import { cn } from "@/shared/lib/utils";

// ── Backend config ────────────────────────────────────────────────────────────

const CHAT_URL =
  process.env.NEXT_PUBLIC_CHAT_URL ?? "http://155.212.216.197:8054";
const WS_BASE = CHAT_URL.replace(/^https?/, (m) =>
  m === "https" ? "wss" : "ws",
);

// ── Types ─────────────────────────────────────────────────────────────────────

type Chat = {
  id: string;
  name: string;
  role?: string;
  avatar: string;
  isAI?: boolean;
  lastMessage: string;
  isLastMine?: boolean;
  time: string;
  unreadCount: number;
  isOnline?: boolean;
  status?: string;
};

type Message = {
  id: number;
  content: string;
  timestamp: string;
  isMe: boolean;
  isRead?: boolean;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatTime = (timestamp: string) =>
  new Date(timestamp).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });

// ── WebSocket hook ────────────────────────────────────────────────────────────

function useChatRoom(roomName: string, currentUser: string | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!currentUser || !roomName) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setMessages([]);
    setIsConnected(false);
    setTypingUsers(new Set());

    // 1. Load history
    getChatMessages(roomName)
      .then((history) =>
        setMessages(
          history.map((m) => ({
            id: m.id,
            content: m.content,
            timestamp: m.timestamp,
            isMe: m.username === currentUser,
            isRead: false,
          })),
        ),
      )
      .catch(() => {})
      .finally(() => setIsLoading(false));

    // 2. Open WebSocket (browser sends session cookie automatically)
    const ws = new WebSocket(`${WS_BASE}/ws/chat/${roomName}/`);
    wsRef.current = ws;

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);
    ws.onerror = () => setIsConnected(false);

    ws.onmessage = (e: MessageEvent) => {
      const data = JSON.parse(e.data as string) as Record<string, unknown>;

      switch (data.type) {
        case "chat_message": {
          // Server echoes our own messages too — skip since we added them optimistically
          if ((data.sender_username as string) === currentUser) return;
          setMessages((prev) => [
            ...prev,
            {
              id: data.message_id as number,
              content: data.message as string,
              timestamp: data.timestamp as string,
              isMe: false,
              isRead: false,
            },
          ]);
          // Auto-mark as read since it's visible
          ws.send(
            JSON.stringify({ type: "read", message_id: data.message_id }),
          );
          break;
        }
        case "typing": {
          const username = data.username as string;
          if (username === currentUser) return;
          setTypingUsers((prev) => {
            const next = new Set(prev);
            if (data.is_typing) next.add(username);
            else next.delete(username);
            return next;
          });
          break;
        }
        case "read": {
          const msgId = data.message_id as number;
          setMessages((prev) =>
            prev.map((m) => (m.id === msgId ? { ...m, isRead: true } : m)),
          );
          break;
        }
        // user_join / user_leave — could update online list, skip for now
      }
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [roomName, currentUser]);

  const sendMessage = useCallback((text: string) => {
    if (!text.trim()) return;
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    // Optimistic add
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        content: text,
        timestamp: new Date().toISOString(),
        isMe: true,
        isRead: false,
      },
    ]);

    wsRef.current.send(JSON.stringify({ type: "chat_message", message: text }));
  }, []);

  const sendTyping = useCallback((isTyping: boolean) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    wsRef.current.send(JSON.stringify({ type: "typing", is_typing: isTyping }));
  }, []);

  return {
    messages,
    isConnected,
    isLoading,
    typingUsers,
    sendMessage,
    sendTyping,
  };
}

// ── Inline SVG icons ──────────────────────────────────────────────────────────

const VideoIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14" />
    <rect x="3" y="6" width="12" height="12" rx="2" />
  </svg>
);

const ShareIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1" />
    <path d="M12 3v13M8 7l4-4 4 4" />
  </svg>
);

const MicIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z" />
    <path d="M19 10v1a7 7 0 01-14 0v-1" />
    <path d="M12 18v4M8 22h8" />
  </svg>
);

const SendIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
);

const ImageAttachIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <path d="M21 15l-5-5L5 21" />
  </svg>
);

const LinkIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
  </svg>
);

const FileIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
    <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
  </svg>
);

// ── Avatar ────────────────────────────────────────────────────────────────────

const Avatar = ({
  chat,
  size = 48,
}: {
  chat: Pick<Chat, "avatar" | "name" | "isAI" | "isOnline">;
  size?: number;
}) => {
  const dim = `${size}px`;
  return (
    <div className="relative shrink-0" style={{ width: dim, height: dim }}>
      {chat.isAI ? (
        <div
          className="flex items-center justify-center rounded-full bg-[#FFF0E8] text-2xl"
          style={{ width: dim, height: dim }}
        >
          🐱
        </div>
      ) : chat.avatar ? (
        <img
          src={chat.avatar}
          alt={chat.name}
          className="rounded-full object-cover"
          style={{ width: dim, height: dim }}
        />
      ) : (
        <div
          className="flex items-center justify-center rounded-full bg-border-soft text-muted font-semibold"
          style={{ width: dim, height: dim }}
        >
          {chat.name[0]}
        </div>
      )}
      {chat.isOnline && (
        <span className="absolute bottom-0 right-0 block size-3 rounded-full bg-[#4CAF50] ring-2 ring-white" />
      )}
    </div>
  );
};

// ── Read receipt ──────────────────────────────────────────────────────────────

const ReadCheck = ({ isRead }: { isRead?: boolean }) => (
  <span
    className={cn(
      "flex items-center justify-center size-3.5 rounded-full shrink-0",
      isRead ? "bg-[#4CAF50]" : "bg-[#D1D2D4]",
    )}
  >
    <svg width="8" height="8" viewBox="0 0 12 10" fill="none">
      <path
        d="M1 5l3.5 3.5L11 1"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);

// ── Main component ────────────────────────────────────────────────────────────

export const ChatPage = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    if (typeof window !== "undefined")
      return localStorage.getItem("chat_username");
    return null;
  });
  const [loginInput, setLoginInput] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState("");

  const [activeChatId, setActiveChatId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");
  const [isAttachOpen, setIsAttachOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const attachRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: roomsData } = useQuery({
    queryKey: chatKeys.rooms(),
    queryFn: getChatRooms,
    enabled: !!currentUser,
  });

  const rooms: Chat[] = (roomsData?.data ?? []).map((r) => ({
    id: r.room_name,
    name: r.interlocutor.display_name,
    avatar: r.interlocutor.avatar ?? "",
    lastMessage: r.last_message?.content ?? "",
    isLastMine: r.last_message?.is_mine ?? false,
    time: r.last_message ? formatTime(r.last_message.timestamp) : "",
    unreadCount: r.unread_count,
    isOnline: false,
  }));

  const activeChat = rooms.find((c) => c.id === activeChatId);

  const {
    messages,
    isConnected,
    isLoading,
    typingUsers,
    sendMessage,
    sendTyping,
  } = useChatRoom(activeChatId, currentUser);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setIsAttachOpen(false);
  }, [activeChatId]);

  // Auto-select first room when loaded
  useEffect(() => {
    if (rooms.length > 0 && !activeChatId) {
      setActiveChatId(rooms[0].id);
    }
  }, [rooms, activeChatId]);

  // Close attach popup on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (attachRef.current && !attachRef.current.contains(e.target as Node))
        setIsAttachOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogin = async () => {
    const username = loginInput.trim();
    if (!username) return;
    setIsLoggingIn(true);
    setLoginError("");
    try {
      await chatLoginFn(username);
      setCurrentUser(username);
      localStorage.setItem("chat_username", username);
    } catch {
      setLoginError("Ошибка входа. Попробуйте снова.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);
    sendTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => sendTyping(false), 2000);
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText("");
    setIsAttachOpen(false);
    sendTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("chat_username");
  };

  const filteredChats = rooms.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const typingLabel =
    typingUsers.size > 0
      ? `${Array.from(typingUsers).join(", ")} печатает...`
      : null;

  // ── Login screen ──────────────────────────────────────────────────────────

  if (!currentUser) {
    return (
      <main className="min-h-screen bg-background flex flex-col">
        <div className="hidden md:block">
          <Header />
        </div>
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 w-full max-w-sm shadow-sm">
            <h2 className="text-xl font-semibold text-foreground mb-1">
              Войти в чат
            </h2>
            <p className="text-sm text-muted mb-6">
              Введите ваше имя пользователя
            </p>
            <input
              type="text"
              placeholder="Имя пользователя"
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              className="w-full px-4 py-3 rounded-xl border border-border-soft text-foreground text-sm outline-none focus:border-primary transition-colors mb-3"
            />
            {loginError && (
              <p className="text-xs text-red-500 mb-3">{loginError}</p>
            )}
            <button
              onClick={handleLogin}
              disabled={!loginInput.trim() || isLoggingIn}
              className="w-full py-3 rounded-xl bg-primary text-white text-sm font-medium disabled:bg-border-soft disabled:text-muted transition-colors"
            >
              {isLoggingIn ? "Вход..." : "Войти"}
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ── Main chat UI ──────────────────────────────────────────────────────────

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <div className="hidden md:block">
        <Header />
      </div>

      <div className="flex-1 w-full max-w-350 mx-auto md:px-10 flex flex-col pt-0 md:pt-8 pb-0 md:pb-10">
        <div className="hidden md:flex items-center justify-between mb-6">
          <h1 className="text-[28px] font-semibold text-foreground">Чаты</h1>
          <button
            onClick={handleLogout}
            className="text-xs text-muted hover:text-foreground transition-colors"
          >
            {currentUser} · Выйти
          </button>
        </div>

        <div className="flex flex-1 gap-5 md:h-[calc(100vh-220px)] min-h-150 relative">
          {/* ── LEFT: chat list ────────────────────────────────────────── */}
          <div
            className={cn(
              "w-full md:w-85 lg:w-92.5 flex flex-col gap-3 shrink-0",
              activeChatId
                ? "hidden md:flex"
                : "flex absolute inset-0 z-10 md:relative p-4 md:p-0",
            )}
          >
            {/* Search + filter */}
            <div className="flex gap-2">
              <div className="flex-1 bg-white border border-border-soft rounded-full px-4 py-2.5 flex items-center gap-2">
                <SearchIcon className="size-4 text-muted shrink-0" />
                <input
                  type="text"
                  placeholder="Поиск"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full outline-none bg-transparent text-foreground text-sm placeholder:text-muted"
                />
              </div>
              <button className="flex items-center justify-center size-10.5 shrink-0 bg-white border border-border-soft rounded-full hover:bg-gray-50 transition-colors text-foreground">
                <FilterSample className="size-4" />
              </button>
            </div>

            {/* Chat items */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-2 pb-4 md:pb-0 scrollbar-hide">
              {filteredChats.map((chat) => {
                const isActive = activeChatId === chat.id;
                return (
                  <button
                    key={chat.id}
                    onClick={() => setActiveChatId(chat.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-colors text-left w-full",
                      isActive ? "bg-[#FEF3F0]" : "bg-white hover:bg-gray-50",
                    )}
                  >
                    <Avatar chat={chat} size={48} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-baseline gap-1 min-w-0 mr-2">
                          <span className="font-semibold text-foreground text-sm truncate">
                            {chat.name}
                          </span>
                          {chat.role && (
                            <span className="text-xs text-muted truncate shrink-0">
                              ({chat.role})
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-muted shrink-0">
                          {chat.time}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-muted truncate">
                          {chat.isLastMine ? (
                            <span>
                              <span className="text-foreground">Вы: </span>
                              {chat.lastMessage.replace("Вы: ", "")}
                            </span>
                          ) : (
                            chat.lastMessage
                          )}
                        </p>
                        {chat.unreadCount > 0 && (
                          <div className="flex items-center justify-center min-w-5 h-5 px-1 bg-primary rounded-full shrink-0">
                            <span className="text-[10px] font-medium text-white">
                              {chat.unreadCount}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── RIGHT: chat window ─────────────────────────────────────── */}
          <div
            className={cn(
              "flex-1 bg-white border border-border-soft rounded-3xl flex flex-col overflow-hidden",
              !activeChatId
                ? "hidden md:flex"
                : "flex absolute inset-0 z-20 md:relative",
            )}
          >
            {activeChat ? (
              <>
                {/* Chat header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border-soft">
                  <div className="flex items-center gap-3">
                    <button
                      className="md:hidden flex items-center justify-center size-9 rounded-full hover:bg-gray-50 text-foreground mr-1"
                      onClick={() => setActiveChatId("")}
                    >
                      <HeaderBackIcon className="size-5" />
                    </button>
                    <Avatar chat={activeChat} size={40} />
                    <div>
                      <p className="font-semibold text-foreground text-sm leading-tight">
                        {activeChat.name}
                        {activeChat.role && (
                          <span className="font-normal text-muted">
                            {" "}
                            ({activeChat.role})
                          </span>
                        )}
                      </p>
                      <p className="text-xs leading-tight mt-0.5 flex items-center gap-1">
                        {typingLabel ? (
                          <span className="text-primary animate-pulse">
                            {typingLabel}
                          </span>
                        ) : isConnected ? (
                          <>
                            <span className="inline-block size-1.5 rounded-full bg-[#4CAF50]" />
                            <span className="text-[#4CAF50]">В сети</span>
                          </>
                        ) : (
                          <span className="text-muted">
                            {isLoading ? "Загрузка..." : "Подключение..."}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="flex items-center justify-center size-9 rounded-full hover:bg-background transition-colors text-foreground">
                      <VideoIcon />
                    </button>
                    <button className="flex items-center justify-center size-9 rounded-full hover:bg-background transition-colors text-foreground">
                      <ShareIcon />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-2 scrollbar-hide">
                  {isLoading ? (
                    <div className="flex-1 flex items-center justify-center text-muted text-sm">
                      Загрузка истории...
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-center mb-2">
                        <span className="bg-background text-muted text-xs px-4 py-1 rounded-full">
                          Сегодня
                        </span>
                      </div>

                      {messages.length === 0 && (
                        <p className="text-center text-sm text-muted mt-8">
                          Сообщений пока нет. Начните общение!
                        </p>
                      )}

                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={cn(
                            "flex flex-col max-w-[75%] md:max-w-[65%]",
                            msg.isMe ? "self-end" : "self-start",
                          )}
                        >
                          <div
                            className={cn(
                              "px-4 py-2.5 text-[14px] leading-normal",
                              msg.isMe
                                ? "bg-primary text-white rounded-2xl rounded-br-sm"
                                : "bg-background text-foreground rounded-2xl rounded-bl-sm",
                            )}
                          >
                            {msg.content}
                          </div>
                          <div
                            className={cn(
                              "flex items-center gap-1 mt-1",
                              msg.isMe ? "self-end" : "self-start",
                            )}
                          >
                            <span className="text-[11px] text-muted">
                              {formatTime(msg.timestamp)}
                            </span>
                            {msg.isMe && <ReadCheck isRead={msg.isRead} />}
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input area */}
                <div
                  className="px-4 py-3 border-t border-border-soft relative"
                  ref={attachRef}
                >
                  {/* Attach popup */}
                  {isAttachOpen && (
                    <div className="absolute bottom-[calc(100%+6px)] right-14 bg-white border border-border-soft rounded-2xl shadow-lg py-1 w-48 z-50">
                      <button className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-background text-sm text-foreground transition-colors">
                        <ImageAttachIcon className="text-muted" />
                        Изображение
                      </button>
                      <button className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-background text-sm text-foreground transition-colors">
                        <LinkIcon className="text-muted" />
                        Ссылка
                      </button>
                      <button className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-background text-sm text-foreground transition-colors">
                        <FileIcon className="text-muted" />
                        Файл
                      </button>
                    </div>
                  )}

                  <div className="flex gap-2 items-center">
                    {/* Input */}
                    <div className="flex-1 bg-white border border-border-soft rounded-full flex items-center px-4 py-2.5 gap-2 focus-within:border-primary transition-colors min-h-11.5">
                      <input
                        type="text"
                        placeholder="Введите текст"
                        value={inputText}
                        onChange={handleInputChange}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        onBlur={() => sendTyping(false)}
                        className="flex-1 outline-none text-foreground text-sm bg-transparent placeholder:text-muted"
                      />
                      <button
                        onClick={() => setIsAttachOpen((v) => !v)}
                        className={cn(
                          "shrink-0 transition-colors",
                          isAttachOpen
                            ? "text-primary"
                            : "text-muted hover:text-foreground",
                        )}
                      >
                        <MicIcon />
                      </button>
                    </div>

                    {/* Send */}
                    <button
                      onClick={handleSend}
                      disabled={!inputText.trim() || !isConnected}
                      className="flex items-center justify-center size-11.5 shrink-0 rounded-full bg-primary disabled:bg-border-soft text-white disabled:text-muted transition-colors"
                    >
                      <SendIcon />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted gap-3">
                <div className="size-16 bg-background rounded-full flex items-center justify-center text-3xl">
                  💬
                </div>
                <p className="text-sm">Выберите чат для начала общения</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};
