"use client";

import { FC, useEffect, useRef } from "react";

import { cn } from "@/shared/lib/utils";

import { formatMessageTime } from "../model/lib";
import type { ChatThreadMessage } from "../model/types";

const ReadReceipt: FC<{ isRead?: boolean }> = ({ isRead }) => (
  <span
    className={cn(
      "flex items-center justify-center size-3.5 rounded-full shrink-0",
      isRead ? "bg-[#4CAF50]" : "bg-[#D1D2D4]",
    )}
  >
    <svg width="8" height="8" viewBox="0 0 12 10" fill="none">
      <path
        d="M1 5l3.5 3.5L11 1"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);

const MessageBubble: FC<{ message: ChatThreadMessage }> = ({ message }) => (
  <div
    className={cn(
      "flex flex-col max-w-[75%] md:max-w-[65%]",
      message.isMine ? "self-end" : "self-start",
    )}
  >
    <div
      className={cn(
        "px-4 py-2.5 text-sm leading-normal whitespace-pre-wrap break-words",
        message.isMine
          ? "bg-primary text-white rounded-2xl rounded-br-sm"
          : "bg-background text-foreground rounded-2xl rounded-bl-sm",
      )}
    >
      {message.content}
    </div>
    <div
      className={cn(
        "flex items-center gap-1 mt-1",
        message.isMine ? "self-end" : "self-start",
      )}
    >
      <span className="text-[11px] text-muted">
        {formatMessageTime(message.createdAt)}
      </span>
      {message.isMine && message.isRead !== undefined && (
        <ReadReceipt isRead={message.isRead} />
      )}
    </div>
  </div>
);

const TypingBubble = () => (
  <div className="self-start bg-background rounded-2xl rounded-bl-sm px-4 py-3">
    <div className="flex gap-1">
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className="size-1.5 rounded-full bg-muted animate-bounce"
          style={{ animationDelay: `${index * 150}ms` }}
        />
      ))}
    </div>
  </div>
);

type Props = {
  messages: ChatThreadMessage[];
  isLoading: boolean;
  emptyHint: string;
  error?: string | null;
  pendingReply?: boolean;
};

export const MessageThread: FC<Props> = ({
  messages,
  isLoading,
  emptyHint,
  error,
  pendingReply = false,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pendingReply]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted text-sm">
        Загрузка истории...
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-2 scrollbar-hide">
      {error && (
        <div className="self-center bg-[#FFF0EE] text-primary text-xs px-4 py-1.5 rounded-full">
          {error}
        </div>
      )}

      {messages.length === 0 && !error && (
        <p className="text-center text-sm text-muted mt-8">{emptyHint}</p>
      )}

      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {pendingReply && <TypingBubble />}

      <div ref={bottomRef} />
    </div>
  );
};
