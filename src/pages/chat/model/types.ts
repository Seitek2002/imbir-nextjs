import type { AiRecommendations } from "@/shared/api";

// View-model shared by both the user-to-user chat and the AI assistant.
// `isMine` decides bubble alignment; the data layer maps each source onto it.
export type ChatThreadMessage = {
  id: number;
  content: string;
  createdAt: string;
  isMine: boolean;
  isRead?: boolean;
  // Системное уведомление (sender === null) — рендерится плашкой по центру.
  isSystem?: boolean;
  // ID записи нужен для внутреннего маршрута LiveKit.
  consultationId?: number;
  // Есть только у ответов ИИ-ассистента — карточки врачей/клиник/услуг под
  // текстом сообщения (см. RecommendationCards). Обычный чат этого не шлёт.
  recommendations?: AiRecommendations;
};

// A row in the conversation list. The AI assistant is a synthetic "room 0".
export type Conversation = {
  id: number;
  name: string;
  lastMessage: string;
  lastMessageAt: string | null;
  isAi: boolean;
  // ID собеседника (не комнаты). Нужен, чтобы отобрать итоги созвонов именно
  // с ним: списки записей отдают все записи пользователя. У ИИ-чата нет.
  partnerId?: number;
};

export type ConnectionState = "connecting" | "open" | "closed" | "error";
