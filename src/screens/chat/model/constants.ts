const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://imbir.sino0on.ru";

// The chat WebSocket lives on the same host as the JWT API: http→ws, https→wss.
export const CHAT_WS_BASE = API_URL.replace(/^http/, "ws");

// The AI assistant is presented as a pinned conversation with id 0.
export const AI_ROOM_ID = 0;

export const AI_ASSISTANT_NAME = "ИИ-помощник";
