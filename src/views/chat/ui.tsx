"use client";

import { useEffect, useRef, useState } from "react";

import { Footer, Header } from "@/widgets";

import { cn } from "@/shared/lib/utils";

// --- ТИПЫ ДАННЫХ ---
type Chat = {
  id: string;
  name: string;
  role?: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unreadCount: number;
  isOnline?: boolean;
  status?: string; // Например "Был недавно"
};

type Message = {
  id: number;
  text: string;
  isMe: boolean;
  time: string;
  isRead?: boolean;
};

// --- МОКОВЫЕ ДАННЫЕ (ЧАТЫ) ---
const MOCK_CHATS: Chat[] = [
  {
    id: "ai",
    name: "Имбирь",
    role: "ИИ-Ассистент",
    avatar: "/assets/imbir-avatar.png",
    lastMessage: "Пожалуйста, рад помочь вам, не забывайте...",
    time: "06:30",
    unreadCount: 2,
    isOnline: true,
  },
  {
    id: "1",
    name: "Dr. Putri Anggraheni",
    role: "Врач-терапевт",
    avatar: "/assets/doctor-1.png",
    lastMessage: "Пожалуйста, начните видеозвонок...",
    time: "09:06",
    unreadCount: 0,
    status: "Был недавно",
  },
  {
    id: "2",
    name: "Dr. Alan Smith",
    avatar: "/assets/doctor-2.png",
    lastMessage: "Нет проблем, рад, что смог помочь.",
    time: "08:45",
    unreadCount: 4,
  },
];

// --- МОКОВЫЕ ДАННЫЕ (СООБЩЕНИЯ ДЛЯ ДЕМО) ---
const INITIAL_MESSAGES: Message[] = [
  {
    id: 1,
    text: "Здравствуйте, доктор, доброе утро.",
    isMe: true,
    time: "09:01",
    isRead: true,
  },
  {
    id: 2,
    text: "У меня была дискомфорт в груди в течение нескольких дней, особенно когда я глубоко дышу.",
    isMe: true,
    time: "09:01",
    isRead: true,
  },
  { id: 3, text: "Здравствуйте, доброе утро.", isMe: false, time: "09:02" },
  {
    id: 4,
    text: "Спасибо, что сообщили. Как долго вы испытываете этот дискомфорт?",
    isMe: false,
    time: "09:02",
  },
  {
    id: 5,
    text: "И чувствуете ли вы другие симптомы, такие как одышка или кашель?",
    isMe: false,
    time: "09:02",
  },
  {
    id: 6,
    text: "Это началось около трех дней назад. Да, иногда я чувствую легкую одышку, но кашля нет.",
    isMe: true,
    time: "09:03",
    isRead: true,
  },
  {
    id: 7,
    text: "Понял, давайте созвонимся, чтобы выяснить, где и как болит.",
    isMe: false,
    time: "09:04",
  },
  { id: 8, text: "Конечно, доктор!", isMe: true, time: "09:04", isRead: true },
  {
    id: 9,
    text: "Пожалуйста, начните видеозвонок...",
    isMe: false,
    time: "09:06",
  },
];

export const ChatPage = () => {
  const [activeChatId, setActiveChatId] = useState<string>("1"); // Поставил чат с доктором по умолчанию
  const [searchQuery, setSearchQuery] = useState("");

  // Стейты для окна переписки
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState("");
  const [isAttachOpen, setIsAttachOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeChat = MOCK_CHATS.find((c) => c.id === activeChatId);

  // Автоскролл вниз при новом сообщении
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Сброс сообщений при смене чата (эмуляция загрузки истории)
  useEffect(() => {
    setMessages(INITIAL_MESSAGES);
    setIsAttachOpen(false);
  }, [activeChatId]);

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const newMessage: Message = {
      id: Date.now(),
      text: inputText,
      isMe: true,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isRead: false,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputText("");
    setIsAttachOpen(false);

    // Эмуляция ответа собеседника (чтобы было веселее тестить)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "Сообщение получено. Ожидайте ответа специалиста.",
          isMe: false,
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSendMessage();
  };

  return (
    <main className="min-h-screen bg-[#F2F3F5] flex flex-col relative">
      <div className="hidden md:block">
        <Header />
      </div>

      <div className="flex-1 w-full max-w-[1400px] mx-auto md:px-10 flex flex-col pt-0 md:pt-8 pb-0 md:pb-10">
        <h1 className="text-3xl font-semibold text-[#191A1B] mb-6 hidden md:block">
          Чаты
        </h1>

        <div className="flex flex-1 gap-6 md:h-[calc(100vh-240px)] min-h-[600px] relative">
          {/* === ЛЕВАЯ КОЛОНКА === */}
          <div
            className={cn(
              "w-full md:w-[340px] lg:w-[380px] flex flex-col gap-4 shrink-0 bg-[#F2F3F5] p-4 md:p-0",
              activeChatId
                ? "hidden md:flex"
                : "flex absolute inset-0 z-10 md:relative",
            )}
          >
            <div className="flex gap-2">
              <div className="flex-1 bg-white border border-[#E3E4E5] rounded-full px-4 py-2.5 flex items-center gap-2">
                <span className="text-[#838A8D] text-lg">🔍</span>
                <input
                  type="text"
                  placeholder="Поиск"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full outline-none bg-transparent text-[#191A1B] text-sm"
                />
              </div>
              <button className="flex items-center justify-center size-[42px] shrink-0 bg-white border border-[#E3E4E5] rounded-full hover:bg-gray-50 transition-colors">
                <span className="text-[#191A1B]">⚙️</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col gap-2 pb-20 md:pb-0">
              {MOCK_CHATS.map((chat) => {
                const isActive = activeChatId === chat.id;
                return (
                  <div
                    key={chat.id}
                    onClick={() => setActiveChatId(chat.id)}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-colors border",
                      isActive
                        ? "bg-[#FFF2F0] border-[#F5653E]"
                        : "bg-white border-transparent hover:border-[#E3E4E5]",
                    )}
                  >
                    <div className="relative size-12 rounded-full bg-gray-200 shrink-0">
                      {chat.isOnline && (
                        <div className="absolute bottom-0 right-0 size-3 bg-[#4CAF50] border-2 border-white rounded-full z-10" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-baseline gap-1 truncate">
                          <span className="font-semibold text-[#191A1B] truncate">
                            {chat.name}
                          </span>
                          {chat.role && (
                            <span className="text-xs text-[#838A8D] truncate">
                              ({chat.role})
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-[#838A8D] shrink-0 ml-2">
                          {chat.time}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm text-[#838A8D] truncate">
                          {chat.lastMessage}
                        </p>
                        {chat.unreadCount > 0 && (
                          <div className="flex items-center justify-center size-5 bg-[#F5653E] rounded-full shrink-0">
                            <span className="text-[10px] font-medium text-white">
                              {chat.unreadCount}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* === ПРАВАЯ КОЛОНКА (ОКНО ЧАТА) === */}
          <div
            className={cn(
              "flex-1 bg-white md:border border-[#E3E4E5] md:rounded-3xl flex flex-col overflow-hidden",
              !activeChatId
                ? "hidden md:flex"
                : "flex absolute inset-0 z-20 md:relative",
            )}
          >
            {activeChat ? (
              <>
                {/* ШАПКА ЧАТА */}
                <div className="flex items-center justify-between p-4 border-b border-[#E3E4E5] bg-white">
                  <div className="flex items-center gap-3">
                    {/* Кнопка "Назад" только для мобилок */}
                    <button
                      className="md:hidden flex items-center justify-center size-10 rounded-full hover:bg-gray-50 mr-1"
                      onClick={() => setActiveChatId("")}
                    >
                      <span className="text-xl">←</span>
                    </button>
                    <div className="size-10 rounded-full bg-[#E3E4E5] shrink-0" />
                    <div className="flex flex-col">
                      <span className="font-semibold text-[#191A1B]">
                        {activeChat.name}
                      </span>
                      <span className="text-xs text-[#838A8D]">
                        {activeChat.status || "В сети"}
                      </span>
                    </div>
                  </div>
                  {/* Доп. действия в шапке (опционально) */}
                  <button className="text-[#191A1B] p-2">⋮</button>
                </div>

                {/* ЛЕНТА СООБЩЕНИЙ */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-4 scrollbar-hide bg-[#F8F9FA] md:bg-white">
                  {/* Разделитель "Сегодня" */}
                  <div className="flex justify-center mb-2">
                    <span className="bg-[#F2F3F5] text-[#838A8D] text-xs px-3 py-1 rounded-full">
                      Сегодня
                    </span>
                  </div>

                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex flex-col max-w-[85%] md:max-w-[70%]",
                        msg.isMe ? "self-end" : "self-start",
                      )}
                    >
                      <div
                        className={cn(
                          "px-4 py-2.5 text-[15px] leading-relaxed shadow-sm",
                          msg.isMe
                            ? "bg-[#F5653E] text-white rounded-l-2xl rounded-tr-2xl"
                            : "bg-[#F2F3F5] text-[#191A1B] rounded-r-2xl rounded-tl-2xl",
                        )}
                      >
                        {msg.text}
                      </div>
                      {/* Время и галочки */}
                      <div
                        className={cn(
                          "flex items-center gap-1 mt-1 text-[11px] text-[#838A8D]",
                          msg.isMe ? "self-end" : "self-start ml-2",
                        )}
                      >
                        {msg.isMe && (
                          <span className="text-[#4CAF50] font-bold">
                            {msg.isRead ? "✓✓" : "✓"}
                          </span>
                        )}
                        {msg.time}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* ЗОНА ВВОДА */}
                <div className="p-4 bg-white border-t border-[#E3E4E5] relative">
                  {/* Меню скрепки (Pop-up) */}
                  {isAttachOpen && (
                    <div className="absolute bottom-20 left-4 bg-white border border-[#E3E4E5] rounded-2xl shadow-lg flex flex-col py-2 w-48 z-50">
                      <button className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm text-[#191A1B] text-left transition-colors">
                        <span className="text-lg">🖼️</span> Изображение
                      </button>
                      <button className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm text-[#191A1B] text-left transition-colors">
                        <span className="text-lg">🔗</span> Ссылка
                      </button>
                      <button className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm text-[#191A1B] text-left transition-colors">
                        <span className="text-lg">📄</span> Файл
                      </button>
                    </div>
                  )}

                  <div className="flex gap-2 items-center">
                    <div className="flex-1 bg-white border border-[#E3E4E5] rounded-full flex items-center px-4 py-2 gap-2 focus-within:border-[#F5653E] transition-colors">
                      <input
                        type="text"
                        placeholder="Введите текст"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="flex-1 outline-none text-[#191A1B] text-[15px] bg-transparent"
                      />
                      <button
                        onClick={() => setIsAttachOpen(!isAttachOpen)}
                        className={cn(
                          "text-xl p-1 transition-colors",
                          isAttachOpen
                            ? "text-[#F5653E]"
                            : "text-[#838A8D] hover:text-[#191A1B]",
                        )}
                      >
                        📎
                      </button>
                    </div>

                    <button
                      onClick={handleSendMessage}
                      disabled={!inputText.trim()}
                      className="flex items-center justify-center bg-[#F5653E] disabled:bg-[#F2F3F5] disabled:text-[#838A8D] text-white rounded-full size-[46px] shrink-0 transition-colors"
                    >
                      {/* Иконка отправки (Замени на SVG) */}
                      <span className="text-lg ml-0.5 mt-0.5">➢</span>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-[#838A8D] bg-[#F8F9FA]">
                <div className="size-20 bg-[#E3E4E5] rounded-full mb-4 flex items-center justify-center">
                  💬
                </div>
                <p>Выберите чат для начала общения</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};
