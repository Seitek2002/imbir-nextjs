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
};

// A row in the conversation list. The AI assistant is a synthetic "room 0".
export type Conversation = {
  id: number;
  name: string;
  lastMessage: string;
  lastMessageAt: string | null;
  isAi: boolean;
};

export type ConnectionState = "connecting" | "open" | "closed" | "error";
