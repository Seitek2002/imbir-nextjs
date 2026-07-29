import { apiClient } from "../client";
import {
  AiChatMessage,
  ChatConsultation,
  ChatMessage,
  ChatRoom,
  ChatUnreadCountResponse,
  CreateChatRoomRequest,
  SendAiMessageRequest,
} from "./types";

type ConsultationRole = "patient" | "doctor" | "clinic";

// ── User-to-user chat ───────────────────────────────────────────────────────

export const getChatRooms = async (): Promise<ChatRoom[]> => {
  const { data } = await apiClient.get<ChatRoom[]>("/api/chat/rooms/");
  return data;
};

// Общее число непрочитанных входящих сообщений — для бейджа в хедере.
export const getChatUnreadCount = async (): Promise<number> => {
  const { data } = await apiClient.get<ChatUnreadCountResponse>(
    "/api/chat/rooms/unread-count/",
  );
  return data.unread_count;
};

// Creates a room with another user, or returns the existing one (no duplicates).
export const createChatRoom = async (
  body: CreateChatRoomRequest,
): Promise<ChatRoom> => {
  const { data } = await apiClient.post<ChatRoom>("/api/chat/rooms/", body);
  return data;
};

// Loads the room history. Incoming unread messages are marked read server-side.
export const getRoomMessages = async (
  roomId: number,
): Promise<ChatMessage[]> => {
  const { data } = await apiClient.get<ChatMessage[]>(
    `/api/chat/rooms/${roomId}/messages/`,
  );
  return data;
};

// В текущем ответе системного сообщения нет appointment_id. До расширения
// backend-контракта берём доступные пользователю записи и сопоставляем их с
// уведомлением по дате/времени. Для клиники LiveKit-комнаты недоступны.
export const getChatConsultations = async (
  role: ConsultationRole,
): Promise<ChatConsultation[]> => {
  if (role === "clinic") return [];

  const endpoint =
    role === "doctor"
      ? "/api/doctor/appointments/"
      : "/api/profile/appointments/";
  const { data } = await apiClient.get<{ data: ChatConsultation[] }>(endpoint, {
    params: { page_size: 100 },
  });

  return Array.isArray(data?.data)
    ? data.data.filter(
        (appointment) =>
          appointment.is_online && appointment.status !== "cancelled",
      )
    : [];
};

// ── AI assistant chat (room 0) ──────────────────────────────────────────────

export const getAiChatHistory = async (): Promise<AiChatMessage[]> => {
  const { data } = await apiClient.get<AiChatMessage[]>("/api/chat/ai/");
  return data;
};

// Returns only the assistant reply; the user message is persisted server-side.
// May take 3–10s, so callers must show a loader.
export const sendAiMessage = async (
  body: SendAiMessageRequest,
): Promise<AiChatMessage> => {
  const { data } = await apiClient.post<AiChatMessage>(
    "/api/chat/ai/send/",
    body,
  );
  return data;
};

export const clearAiChat = async (): Promise<void> => {
  await apiClient.delete("/api/chat/ai/");
};
