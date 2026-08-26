import type { AiRecommendations } from "@/shared/api";

// View-model shared by both the user-to-user chat and the AI assistant.
// `isMine` decides bubble alignment; the data layer maps each source onto it.
export type ChatThreadMessage = {
  // ID записи нужен для внутреннего маршрута LiveKit.
  consultationId?: number;
  content: string;
  createdAt: string;
  id: number;
  isMine: boolean;
  isRead?: boolean;
  // Системное уведомление (sender === null) — рендерится плашкой по центру.
  isSystem?: boolean;
  // Есть только у ответов ИИ-ассистента — карточки врачей/клиник/услуг под
  // текстом сообщения (см. RecommendationCards). Обычный чат этого не шлёт.
  recommendations?: AiRecommendations;
};

// A row in the conversation list. The AI assistant is a synthetic "room 0".
export type Conversation = {
  id: number;
  isAi: boolean;
  lastMessage: string;
  lastMessageAt: null | string;
  name: string;
  // ID собеседника (не комнаты). Нужен, чтобы отобрать итоги созвонов именно
  // с ним: списки записей отдают все записи пользователя. У ИИ-чата нет.
  partnerId?: number;
  // Число непрочитанных сообщений в этой комнате (см. ChatRoom.unread_count).
  // У ИИ-чата не отслеживается бэком — остаётся undefined, бейдж не рисуем.
  unreadCount?: number;
};

export type ConnectionState = "closed" | "connecting" | "error" | "open";
