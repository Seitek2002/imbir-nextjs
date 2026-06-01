import { chatClient } from "../client";
import {
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
