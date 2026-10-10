import type { ChatParticipant, ChatRoom } from "@/shared/api";

import type { Conversation } from "./types";

export const formatMessageTime = (iso: string) =>
  new Date(iso).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });

// Ключ календарного дня в локальном времени — по нему лента делится на дни.
export const getDayKey = (iso: string) => {
  const date = new Date(iso);
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
};

// Сколько календарных дней назад (по локальному времени) была дата.
const daysAgo = (date: Date) => {
  const startOf = (value: Date) =>
    new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime();
  return Math.round((startOf(new Date()) - startOf(date)) / 86_400_000);
};

const isThisYear = (date: Date) =>
  date.getFullYear() === new Date().getFullYear();

// Время в списке переписок. Одно «14:30» у письма пятидневной давности
// выглядело сегодняшним: сегодня — HH:MM, вчера — «вчера HH:MM», раньше —
// DD.MM, для прошлых лет — DD.MM.YY.
export const formatConversationTime = (iso: string) => {
  const date = new Date(iso);
  const days = daysAgo(date);
  if (days === 0) return formatMessageTime(iso);
  if (days === 1) return `вчера ${formatMessageTime(iso)}`;
  return date.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: isThisYear(date) ? undefined : "2-digit",
  });
};

// Подпись разделителя дней в ленте: «Сегодня», «Вчера», «5 октября»
// (для прошлых лет — с годом).
export const formatDayLabel = (iso: string) => {
  const date = new Date(iso);
  const days = daysAgo(date);
  if (days === 0) return "Сегодня";
  if (days === 1) return "Вчера";
  return date.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: isThisYear(date) ? undefined : "numeric",
  });
};

// Полные дата и время — подсказка при наведении на время сообщения.
export const formatFullDateTime = (iso: string) =>
  new Date(iso).toLocaleString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
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
    partnerId: interlocutor?.id,
    unreadCount: room.unread_count,
  };
};

export const getInitial = (name: string) => name.trim().charAt(0).toUpperCase();
