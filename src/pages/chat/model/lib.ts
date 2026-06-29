import type { ChatParticipant, ChatRoom } from "@/shared/api";

import type { Conversation } from "./types";

export const formatMessageTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });

// Rooms list both participants; the one that isn't the current user is shown.
export const getInterlocutor = (
  room: ChatRoom,
  currentUserId: number,
): ChatParticipant | null =>
  room.participants.find((p) => p.id !== currentUserId) ??
  room.participants[0] ??
  null;

export const roomToConversation = (
  room: ChatRoom,
  currentUserId: number,
): Conversation => {
  const interlocutor = getInterlocutor(room, currentUserId);
  return {
    id: room.id,
    name: interlocutor?.full_name ?? "Собеседник",
    lastMessage: room.last_message?.content ?? "",
    lastMessageAt: room.last_message?.created_at ?? null,
    isAi: false,
  };
};

export const getInitial = (name: string) => name.trim().charAt(0).toUpperCase();
