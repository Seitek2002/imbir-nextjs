// ── User-to-user chat ───────────────────────────────────────────────────────

export type ChatParticipant = {
  id: number;
  full_name: string;
};

export type ChatRoomLastMessage = {
  content: string;
  created_at: string;
};

export type ChatRoom = {
  id: number;
  participants: ChatParticipant[];
  last_message: ChatRoomLastMessage | null;
  created_at: string;
  // Кол-во непрочитанных сообщений в комнате. Заполняется бэком; пока поля нет —
  // счётчик в хедере остаётся 0. См. бейдж в HeaderChatButton.
  unread_count?: number;
};

export type ChatMessage = {
  id: number;
  // null — системное уведомление (напр. о созданной онлайн-записи).
  sender: ChatParticipant | null;
  content: string;
  created_at: string;
  is_read: boolean;
};

export type CreateChatRoomRequest = {
  user_id: number;
};

// GET /api/chat/rooms/unread-count/ — общее число непрочитанных входящих
// сообщений по всем комнатам. Отдельный лёгкий эндпоинт для бейджа в хедере.
export type ChatUnreadCountResponse = {
  unread_count: number;
};

// WebSocket payloads. The client sends only the text; the server broadcasts a
// full message object to every participant (including the sender — see echo
// handling in the chat-room hook).
export type OutgoingChatMessage = {
  content: string;
};

export type IncomingChatMessage = {
  id: number;
  // null — системное уведомление (напр. о созданной онлайн-записи).
  sender: ChatParticipant | null;
  content: string;
  created_at: string;
  // Обычное сообщение приходит без type (или с "message"); typing — отдельно.
  type?: "message";
};

// Индикатор «печатает…» — тот же сокет, поле type различает кадр.
export type TypingOutgoing = {
  type: "typing";
  is_typing: boolean;
};

export type TypingIncoming = {
  type: "typing";
  user_id: number;
  user_name: string;
  is_typing: boolean;
};

// Любой кадр из сокета комнаты: сообщение или событие typing.
export type IncomingSocketFrame = IncomingChatMessage | TypingIncoming;

// ── AI assistant chat (room 0) ──────────────────────────────────────────────

export type AiChatRole = "user" | "assistant";

export type AiRecommendedDoctor = {
  id: number;
  full_name: string;
  specialty: string;
  photo: string | null;
  rating: string;
  is_online_available: boolean;
};

export type AiRecommendedClinic = {
  id: number;
  name: string;
  logo: string | null;
  city: string;
  rating: string;
};

export type AiRecommendedService = {
  id: number;
  name: string;
  category: string;
  price: string;
  clinic: { id: number; name: string } | null;
};

// Ассистент может порекомендовать врачей/клиники/услуги в подходящий момент
// разговора — фронт рисует их карточками под текстом сообщения. Поле
// присутствует всегда (не на каждый ответ ассистента есть рекомендации —
// тогда все три массива просто пустые), максимум по 3 записи в каждом.
export type AiRecommendations = {
  doctors: AiRecommendedDoctor[];
  clinics: AiRecommendedClinic[];
  services: AiRecommendedService[];
};

export type AiChatMessage = {
  id: number;
  role: AiChatRole;
  content: string;
  recommendations: AiRecommendations;
  created_at: string;
};

export type SendAiMessageRequest = {
  message: string;
};
