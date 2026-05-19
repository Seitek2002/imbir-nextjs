"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Header } from "@/widgets";

import {
  FilterSample,
  HeaderBackIcon,
  SearchIcon,
} from "@/shared/assets/icons";
import { cn } from "@/shared/lib/utils";

// ── Backend config ────────────────────────────────────────────────────────────

const API_BASE = "http://155.212.216.197:8054";
const WS_BASE = "ws://155.212.216.197:8054";
const ROOM = "general";

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
  timestamp: string; // ISO string
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

function useChatRoom(roomName: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);
  // Tracks content of messages we sent to skip WS echo
  const pendingSent = useRef<Set<string>>(new Set());

  useEffect(() => {
    setIsLoading(true);
    setMessages([]);
    setIsConnected(false);

    // 1. Load history
    fetch(`${API_BASE}/api/messages/${roomName}/`)
      .then((r) => r.json())
      .then(
        (history: Array<{ id: number; content: string; timestamp: string }>) =>
          setMessages(history.map((m) => ({ ...m, isMe: false }))),
      )
      .catch(() => {})
      .finally(() => setIsLoading(false));

    // 2. Open WebSocket
    const ws = new WebSocket(`${WS_BASE}/ws/chat/${roomName}/`);
    wsRef.current = ws;

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);
    ws.onerror = () => setIsConnected(false);

    ws.onmessage = (e) => {
      const data = JSON.parse(e.data) as {
        message: string;
        timestamp: string;
      };

      // Skip echo of our own message (already added locally)
      if (pendingSent.current.has(data.message)) {
        pendingSent.current.delete(data.message);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          content: data.message,
          timestamp: data.timestamp,
          isMe: false,
        },
      ]);
    };

    return () => {
      ws.close();
      wsRef.current = null;
    };
  }, [roomName]);

  const sendMessage = useCallback((text: string) => {
    if (!text.trim()) return;
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    // Add locally as isMe immediately (optimistic)
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        content: text,
        timestamp: new Date().toISOString(),
        isMe: true,
        isRead: true,
      },
    ]);

    pendingSent.current.add(text);
    wsRef.current.send(JSON.stringify({ message: text }));

    // Cleanup pending after 5s in case echo never arrives
    setTimeout(() => pendingSent.current.delete(text), 5000);
  }, []);

  return { messages, isConnected, isLoading, sendMessage };
}

const MOCK_CHATS: Chat[] = [
  {
    id: "ai",
    name: "Имбирь",
    role: "ИИ-Ассистент",
    avatar: "",
    isAI: true,
    lastMessage: "Пожалуйста, рад помочь вам, не забывайте.",
    time: "06:30",
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: "alina",
    name: "С. Алина Тимуровна",
    avatar: "https://pravatar.cc/150?img=47",
    lastMessage: "Пожалуйста, рад помочь вам, не забывайте.",
    time: "06:30",
    unreadCount: 2,
    status: "Был недавно",
  },
  {
    id: "alan",
    name: "Dr. Alan Smith",
    avatar: "https://pravatar.cc/150?img=12",
    lastMessage: "Нет проблем, рад, что смог помочь.",
    time: "08:45",
    unreadCount: 4,
  },
  {
    id: "arya",
    name: "Dr. Arya Syaputra",
    avatar: "https://pravatar.cc/150?img=33",
    lastMessage: "Вы: Могу я получить адрес офиса?",
    isLastMine: true,
    time: "11:15",
    unreadCount: 0,
  },
  {
    id: "riri",
    name: "Dr. Riri Permatasari",
    avatar: "https://pravatar.cc/150?img=25",
    lastMessage: "Всегда готов помочь, не стесняйтесь обращаться снов...",
    time: "02:00",
    unreadCount: 0,
  },
  {
    id: "putri",
    name: "Dr. Putri Anggraheni",
    avatar: "https://pravatar.cc/150?img=29",
    lastMessage: "Вы: Спасибо, доктор",
    isLastMine: true,
    time: "06:30",
    unreadCount: 0,
    status: "Был недавно",
  },
];

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

const CloseIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="10"
    height="10"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <path d="M18 6L6 18M6 6l12 12" />
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
          className="flex items-center justify-center rounded-full bg-[#E3E4E5] text-[#838A8D] font-semibold"
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

const ReadCheck = () => (
  <span className="flex items-center justify-center size-3.5 rounded-full bg-[#4CAF50] shrink-0">
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
  const [activeChatId, setActiveChatId] = useState<string>("putri");
  const [searchQuery, setSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");
  const [isAttachOpen, setIsAttachOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const attachRef = useRef<HTMLDivElement>(null);
  const activeChat = MOCK_CHATS.find((c) => c.id === activeChatId);

  const { messages, isConnected, isLoading, sendMessage } =
    useChatRoom(activeChatId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    setIsAttachOpen(false);
  }, [activeChatId]);

  // Close attach popup on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (attachRef.current && !attachRef.current.contains(e.target as Node))
        setIsAttachOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText("");
    setIsAttachOpen(false);
  };

  const filteredChats = MOCK_CHATS.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <main className="min-h-screen bg-[#F2F3F5] flex flex-col">
      <div className="hidden md:block">
        <Header />
      </div>

      <div className="flex-1 w-full max-w-350 mx-auto md:px-10 flex flex-col pt-0 md:pt-8 pb-0 md:pb-10">
        <h1 className="text-[28px] font-semibold text-[#191A1B] mb-6 hidden md:block">
          Чаты
        </h1>

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
              <div className="flex-1 bg-white border border-[#E3E4E5] rounded-full px-4 py-2.5 flex items-center gap-2">
                <SearchIcon className="size-4 text-[#838A8D] shrink-0" />
                <input
                  type="text"
                  placeholder="Поиск"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full outline-none bg-transparent text-[#191A1B] text-sm placeholder:text-[#838A8D]"
                />
              </div>
              <button className="flex items-center justify-center size-10.5 shrink-0 bg-white border border-[#E3E4E5] rounded-full hover:bg-gray-50 transition-colors text-[#191A1B]">
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
                          <span className="font-semibold text-[#191A1B] text-sm truncate">
                            {chat.name}
                          </span>
                          {chat.role && (
                            <span className="text-xs text-[#838A8D] truncate shrink-0">
                              ({chat.role})
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-[#838A8D] shrink-0">
                          {chat.time}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-[#838A8D] truncate">
                          {chat.isLastMine ? (
                            <span>
                              <span className="text-[#191A1B]">Вы: </span>
                              {chat.lastMessage.replace("Вы: ", "")}
                            </span>
                          ) : (
                            chat.lastMessage
                          )}
                        </p>
                        {chat.unreadCount > 0 && (
                          <div className="flex items-center justify-center min-w-5 h-5 px-1 bg-[#F5653E] rounded-full shrink-0">
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
              "flex-1 bg-white border border-[#E3E4E5] rounded-3xl flex flex-col overflow-hidden",
              !activeChatId
                ? "hidden md:flex"
                : "flex absolute inset-0 z-20 md:relative",
            )}
          >
            {activeChat ? (
              <>
                {/* Chat header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#E3E4E5]">
                  <div className="flex items-center gap-3">
                    <button
                      className="md:hidden flex items-center justify-center size-9 rounded-full hover:bg-gray-50 text-[#191A1B] mr-1"
                      onClick={() => setActiveChatId("")}
                    >
                      <HeaderBackIcon className="size-5" />
                    </button>
                    <Avatar chat={activeChat} size={40} />
                    <div>
                      <p className="font-semibold text-[#191A1B] text-sm leading-tight">
                        {activeChat.name}
                        {activeChat.role && (
                          <span className="font-normal text-[#838A8D]">
                            {" "}
                            ({activeChat.role})
                          </span>
                        )}
                      </p>
                      <p className="text-xs leading-tight mt-0.5 flex items-center gap-1">
                        {isConnected ? (
                          <>
                            <span className="inline-block size-1.5 rounded-full bg-[#4CAF50]" />
                            <span className="text-[#4CAF50]">В сети</span>
                          </>
                        ) : (
                          <span className="text-[#838A8D]">
                            {isLoading ? "Загрузка..." : "Подключение..."}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="flex items-center justify-center size-9 rounded-full hover:bg-[#F2F3F5] transition-colors text-[#191A1B]">
                      <VideoIcon />
                    </button>
                    <button className="flex items-center justify-center size-9 rounded-full hover:bg-[#F2F3F5] transition-colors text-[#191A1B]">
                      <ShareIcon />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-2 scrollbar-hide">
                  {isLoading ? (
                    <div className="flex-1 flex items-center justify-center text-[#838A8D] text-sm">
                      Загрузка истории...
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-center mb-2">
                        <span className="bg-[#F2F3F5] text-[#838A8D] text-xs px-4 py-1 rounded-full">
                          Сегодня
                        </span>
                      </div>

                      {messages.length === 0 && (
                        <p className="text-center text-sm text-[#838A8D] mt-8">
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
                                ? "bg-[#F5653E] text-white rounded-2xl rounded-br-sm"
                                : "bg-[#F2F3F5] text-[#191A1B] rounded-2xl rounded-bl-sm",
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
                            <span className="text-[11px] text-[#838A8D]">
                              {formatTime(msg.timestamp)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input area */}
                <div
                  className="px-4 py-3 border-t border-[#E3E4E5] relative"
                  ref={attachRef}
                >
                  {/* Attach popup */}
                  {isAttachOpen && (
                    <div className="absolute bottom-[calc(100%+6px)] right-14 bg-white border border-[#E3E4E5] rounded-2xl shadow-lg py-1 w-48 z-50">
                      <button className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-[#F2F3F5] text-sm text-[#191A1B] transition-colors">
                        <ImageAttachIcon className="text-[#838A8D]" />
                        Изображение
                      </button>
                      <button className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-[#F2F3F5] text-sm text-[#191A1B] transition-colors">
                        <LinkIcon className="text-[#838A8D]" />
                        Ссылка
                      </button>
                      <button className="flex items-center gap-3 w-full px-4 py-2.5 hover:bg-[#F2F3F5] text-sm text-[#191A1B] transition-colors">
                        <FileIcon className="text-[#838A8D]" />
                        Файл
                      </button>
                    </div>
                  )}

                  <div className="flex gap-2 items-center">
                    {/* Input */}
                    <div className="flex-1 bg-white border border-[#E3E4E5] rounded-full flex items-center px-4 py-2.5 gap-2 focus-within:border-[#F5653E] transition-colors min-h-11.5">
                      <input
                        type="text"
                        placeholder="Введите текст"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        className="flex-1 outline-none text-[#191A1B] text-sm bg-transparent placeholder:text-[#838A8D]"
                      />
                      <button
                        onClick={() => setIsAttachOpen((v) => !v)}
                        className={cn(
                          "shrink-0 transition-colors",
                          isAttachOpen
                            ? "text-[#F5653E]"
                            : "text-[#838A8D] hover:text-[#191A1B]",
                        )}
                      >
                        <MicIcon />
                      </button>
                    </div>

                    {/* Send */}
                    <button
                      onClick={handleSend}
                      disabled={!inputText.trim() || !isConnected}
                      className="flex items-center justify-center size-11.5 shrink-0 rounded-full bg-[#F5653E] disabled:bg-[#E3E4E5] text-white disabled:text-[#838A8D] transition-colors"
                    >
                      <SendIcon />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-[#838A8D] gap-3">
                <div className="size-16 bg-[#F2F3F5] rounded-full flex items-center justify-center text-3xl">
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
