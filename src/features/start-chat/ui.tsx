"use client";

import { FC } from "react";
import toast from "react-hot-toast";

import { useRouter } from "next/navigation";

import { useMutation } from "@tanstack/react-query";

import { createChatRoom } from "@/shared/api";
import { ChatIcon } from "@/shared/assets/icons";
import { ROUTES } from "@/shared/config";
import { useAuthStore } from "@/shared/store";
import { Button } from "@/shared/ui";

type Props = {
  className?: string;
  // Круглая иконка-кнопка для тесных мест (мобильные карточки).
  compact?: boolean;
  label?: string;
  size?: "lg" | "md" | "sm" | "xs";
  // id пользователя-собеседника (для врача совпадает с id из каталога).
  userId: number;
  variant?: "default" | "outline" | "text";
};

// Кнопка «Написать»: создаёт комнату (или получает существующую — бэк не
// дублирует) и открывает её в чате. Гостя отправляем на логин.
export const StartChatButton: FC<Props> = ({
  userId,
  className,
  size = "md",
  variant = "outline",
  label = "Написать",
  compact = false,
}) => {
  const router = useRouter();
  const isAuthed = useAuthStore((s) => Boolean(s.accessToken));

  const { mutate: startChat, isPending } = useMutation({
    mutationFn: () => createChatRoom({ user_id: userId }),
    onSuccess: (room) => router.push(`${ROUTES.CHATS}?room=${room.id}`),
    onError: () => toast.error("Не удалось открыть чат. Попробуйте ещё раз"),
  });

  const handleClick = () => {
    if (!isAuthed) {
      router.push(ROUTES.LOGIN);
      return;
    }
    startChat();
  };

  if (compact) {
    return (
      <button
        onClick={handleClick}
        disabled={isPending}
        aria-label={label}
        className="w-9 h-9 rounded-full border border-border flex items-center justify-center shrink-0 hover:bg-primary-tint transition-colors disabled:opacity-50"
      >
        <ChatIcon className="w-4 h-4 text-primary" />
      </button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      IconLeft={ChatIcon}
      loading={isPending}
      disabled={isPending}
      onClick={handleClick}
    >
      {label}
    </Button>
  );
};
