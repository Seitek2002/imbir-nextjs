import { apiClient, chatClient } from "../client";
import {
  AIMessage,
  ChatMessage,
  ChatRoom,
  CreateChatRoomRequest,
  CreateChatRoomResponse,
} from "./types";

export const getChatRooms = async (): Promise<{ data: ChatRoom[] }> => {
  const { data } = await chatClient.get<{ data: ChatRoom[] }>(
    "/api/chat/rooms/",
  );
  return data;
};

export const createChatRoom = async (
  body: CreateChatRoomRequest,
): Promise<CreateChatRoomResponse> => {
  const { data } = await chatClient.post<CreateChatRoomResponse>(
    "/api/chat/rooms/",
    body,
  );
  return data;
};

export const getChatMessages = async (
  roomName: string,
): Promise<ChatMessage[]> => {
  const { data } = await chatClient.get<ChatMessage[]>(
    `/api/messages/${roomName}/`,
  );
  return data;
};

export const chatLoginFn = async (username: string): Promise<void> => {
  await chatClient.post("/api/login/", { username });
};

// ── AI-ассистент (основной API, JWT через apiClient) ────────────────────────

export const getAIMessages = async (): Promise<AIMessage[]> => {
  const { data } = await apiClient.get<AIMessage[]>("/api/chat/ai/");
  return data;
};

export const sendAIMessage = async (message: string): Promise<AIMessage> => {
  // Генерация ответа ИИ дольше обычного запроса — даём запас по таймауту.
  const { data } = await apiClient.post<AIMessage>(
    "/api/chat/ai/send/",
    { message },
    { timeout: 60_000 },
  );
  return data;
};
