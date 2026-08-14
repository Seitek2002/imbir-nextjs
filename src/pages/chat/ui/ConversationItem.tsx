import { FC } from "react";

import { cn } from "@/shared/lib/utils";

import { formatMessageTime } from "../model/lib";
import type { Conversation } from "../model/types";
import { ChatAvatar } from "./ChatAvatar";

type Props = {
  conversation: Conversation;
  isActive: boolean;
  onSelect: () => void;
};

export const ConversationItem: FC<Props> = ({
  conversation,
  isActive,
  onSelect,
}) => {
  const preview =
    conversation.lastMessage ||
    (conversation.isAi ? "Задайте вопрос ассистенту" : "Нет сообщений");

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-colors text-left w-full",
        isActive ? "bg-[#FEF3F0]" : "bg-transparent hover:bg-gray-50",
      )}
    >
      <span className="relative shrink-0">
        <ChatAvatar
          name={conversation.name}
          isAi={conversation.isAi}
          size={48}
        />
        {!!conversation.unreadCount && (
          <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 px-1 rounded-full bg-primary text-white text-[10px] font-semibold flex items-center justify-center">
            {conversation.unreadCount > 9 ? "9+" : conversation.unreadCount}
          </span>
        )}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="font-semibold text-foreground text-sm truncate">
            {conversation.name}
          </span>
          {conversation.lastMessageAt && (
            <span className="text-xs text-muted shrink-0">
              {formatMessageTime(conversation.lastMessageAt)}
            </span>
          )}
        </div>
        <p className="text-xs text-muted truncate">{preview}</p>
      </div>
    </button>
  );
};
