"use client";

import { FC, Fragment, useEffect, useRef } from "react";

import { cn } from "@/shared/lib/utils";

import { formatMessageTime } from "../model/lib";
import type { ChatThreadMessage } from "../model/types";
import { RecommendationCards } from "./RecommendationCards";

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
          : "bg-[#EEF1F4] text-foreground rounded-2xl rounded-bl-sm",
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

// Первая ссылка в тексте уведомления — обычно приглашение в видеовстречу.
const URL_RE = /(https?:\/\/\S+)/;

// Системное уведомление (sender === null): плашка по центру ленты.
// Ссылку на видеовстречу выносим в кнопку «Присоединиться».
const SystemNotice: FC<{ message: ChatThreadMessage }> = ({ message }) => {
  const url = message.content.match(URL_RE)?.[0] ?? null;
  // Текст без ссылки — чтобы она не дублировалась под кнопкой.
  const text = message.content.replace(URL_RE, "").replace(/\s+$/, "").trim();

  return (
    <div className="self-center max-w-[85%] my-1 flex flex-col items-center gap-2">
      <div className="bg-[#EEF3FF] text-foreground text-xs leading-normal text-center px-4 py-2 rounded-xl whitespace-pre-wrap break-words">
        {text || message.content}
      </div>
      {url && (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 bg-primary text-white text-xs font-medium px-4 py-2 rounded-full transition-opacity hover:opacity-90"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M23 7l-7 5 7 5V7z" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
          Присоединиться
        </a>
      )}
      <span className="text-[11px] text-muted">
        {formatMessageTime(message.createdAt)}
      </span>
    </div>
  );
};

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
    <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3 scrollbar-hide bg-white">
      {error && (
        <div className="self-center bg-[#FFF0EE] text-primary text-xs px-4 py-1.5 rounded-full">
          {error}
        </div>
      )}

      {messages.length === 0 && !error && (
        <p className="text-center text-sm text-muted mt-8">{emptyHint}</p>
      )}

      {messages.map((message) =>
        message.isSystem ? (
          <SystemNotice key={message.id} message={message} />
        ) : (
          <Fragment key={message.id}>
            <MessageBubble message={message} />
            {!message.isMine && message.recommendations && (
              <RecommendationCards recommendations={message.recommendations} />
            )}
          </Fragment>
        ),
      )}

      {pendingReply && <TypingBubble />}

      <div ref={bottomRef} />
    </div>
  );
};
