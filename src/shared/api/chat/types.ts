export type ChatInterlocutor = {
  username: string;
  display_name: string;
  role: "doctor" | "client" | "clinic";
  avatar: string | null;
};

export type ChatLastMessage = {
  content: string;
  timestamp: string;
  is_mine: boolean;
};

export type ChatRoom = {
  room_name: string;
  interlocutor: ChatInterlocutor;
  last_message: ChatLastMessage | null;
  unread_count: number;
};

export type ChatMessage = {
  id: number;
  content: string;
  username: string;
  timestamp: string;
};

export type CreateChatRoomRequest = {
  target_user_id: number;
};

export type CreateChatRoomResponse = {
  room_name: string;
};

// ── AI-ассистент (основной API, JWT) ────────────────────────────────────────

export type AIMessageRole = "user" | "assistant";

export type AIMessage = {
  id: number;
  role: AIMessageRole;
  content: string;
  created_at: string;
};

export type SendAIMessageRequest = {
  message: string;
};
