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
};

export type ChatMessage = {
  id: number;
  sender: ChatParticipant;
  content: string;
  created_at: string;
  is_read: boolean;
};

export type CreateChatRoomRequest = {
  user_id: number;
};

// WebSocket payloads. The client sends only the text; the server broadcasts a
// full message object to every participant (including the sender — see echo
// handling in the chat-room hook).
export type OutgoingChatMessage = {
  content: string;
};

export type IncomingChatMessage = {
  id: number;
  sender: ChatParticipant;
  content: string;
  created_at: string;
};

// ── AI assistant chat (room 0) ──────────────────────────────────────────────

export type AiChatRole = "user" | "assistant";

export type AiChatMessage = {
  id: number;
  role: AiChatRole;
  content: string;
  created_at: string;
};

export type SendAiMessageRequest = {
  message: string;
};
