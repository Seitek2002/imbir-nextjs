"use client";

import { FC, Fragment, useEffect, useRef, useState } from "react";

import Link from "next/link";

import { cn } from "@/shared/lib/utils";
import { ScrambleText } from "@/shared/ui";

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

type Attachment = {
  name: string;
  url: string;
};

const FILE_MESSAGE_RE = /^(?:[📎🖇]\s*)?([^\n]+)\n((?:https?:\/\/|\/)[^\s]+)$/;
const URL_RE_GLOBAL = /(https?:\/\/[^\s]+)/g;
const ATTACHMENT_PREFIX_RE = /^[📎🖇\uFFFD]\s*/u;

const parseAttachment = (content: string): Attachment | null => {
  const match = content.match(FILE_MESSAGE_RE);
  if (!match) return null;
  return { name: match[1].replace(ATTACHMENT_PREFIX_RE, ""), url: match[2] };
};

const isImageAttachment = ({ name, url }: Attachment) =>
  /\.(?:avif|gif|jpe?g|png|svg|webp)(?:[?#]|$)/i.test(`${name} ${url}`);

const FileIcon: FC<{ isMine: boolean; name: string }> = ({ isMine, name }) => (
  <div
    className={cn(
      "flex size-12 shrink-0 items-center justify-center rounded-xl border text-[9px] font-semibold uppercase",
      isMine ? "border-white/60 text-white" : "border-border-soft text-muted",
    )}
  >
    {name.split(".").pop()?.slice(0, 4) || "file"}
  </div>
);

const AttachmentContent: FC<{
  attachment: Attachment;
  isMine: boolean;
  onImageClick: () => void;
}> = ({ attachment, isMine, onImageClick }) => {
  const image = isImageAttachment(attachment);

  return image ? (
    <button
      type="button"
      onClick={onImageClick}
      className="block w-full overflow-hidden rounded-xl text-left"
      aria-label={`Открыть изображение ${attachment.name}`}
    >
      <img
        src={attachment.url}
        alt={attachment.name}
        loading="lazy"
        className="max-h-72 max-w-full rounded-xl object-contain"
      />
    </button>
  ) : (
    <a
      href={attachment.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex items-center gap-2 rounded-xl p-2 no-underline",
        isMine ? "bg-white/15 text-white" : "bg-white text-foreground",
      )}
    >
      <FileIcon isMine={isMine} name={attachment.name} />
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium">
          {attachment.name}
        </span>
        <span className="block text-xs opacity-70">Скачать файл</span>
      </span>
    </a>
  );
};

const MessageContent: FC<{ content: string }> = ({ content }) => {
  const parts = content.split(URL_RE_GLOBAL);
  return parts.map((part, index) =>
    /^https?:\/\//.test(part) ? (
      <a
        key={index}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 break-all"
      >
        {part}
      </a>
    ) : (
      <Fragment key={index}>{part}</Fragment>
    ),
  );
};

const MessageBubble: FC<{
  message: ChatThreadMessage;
  // Проявлять текст прокруткой букв. Включается только для новых ответов
  // ассистента — история и свои сообщения появляются сразу.
  scramble?: boolean;
  isSelected?: boolean;
  selectionMode?: boolean;
  onContextMenu?: (event: React.MouseEvent, message: ChatThreadMessage) => void;
  onLongPress?: (message: ChatThreadMessage) => void;
  onSelect?: (message: ChatThreadMessage) => void;
}> = ({
  message,
  scramble = false,
  isSelected = false,
  selectionMode = false,
  onContextMenu,
  onLongPress,
  onSelect,
}) => {
  const attachment = parseAttachment(message.content);
  const [isImagePreviewOpen, setIsImagePreviewOpen] = useState(false);
  const longPressTimerRef = useRef<null | ReturnType<typeof setTimeout>>(null);
  const isImage = attachment ? isImageAttachment(attachment) : false;
  const canInteract = message.isMine && !message.isDeleted;

  const clearLongPress = () => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = null;
  };

  const handleTouchStart = () => {
    if (!canInteract || !onLongPress) return;
    clearLongPress();
    longPressTimerRef.current = setTimeout(() => {
      onLongPress(message);
      longPressTimerRef.current = null;
    }, 550);
  };

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!selectionMode || !canInteract || !onSelect) return;
    event.preventDefault();
    event.stopPropagation();
    onSelect(message);
  };

  return (
    <div
      onClick={handleClick}
      onContextMenu={(event) => {
        if (canInteract) onContextMenu?.(event, message);
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={clearLongPress}
      onTouchMove={clearLongPress}
      className={cn(
        "relative flex flex-col max-w-[75%] md:max-w-[65%]",
        message.isMine ? "self-end" : "self-start",
        isSelected && "rounded-2xl ring-2 ring-primary ring-offset-2",
      )}
    >
      {selectionMode && canInteract && (
        <span
          className={cn(
            "absolute -left-6 top-1/2 flex size-5 -translate-y-1/2 items-center justify-center rounded-full border",
            isSelected
              ? "border-primary bg-primary text-white"
              : "border-border-soft bg-white text-transparent",
          )}
          aria-hidden="true"
        >
          ✓
        </span>
      )}
      <div
        className={cn(
          "text-sm leading-normal whitespace-pre-wrap break-words",
          attachment ? "p-1.5" : "px-4 py-2.5",
          message.isMine
            ? "bg-primary text-white rounded-2xl rounded-br-sm"
            : "bg-[#EEF1F4] text-foreground rounded-2xl rounded-bl-sm",
        )}
      >
        {message.isDeleted ? (
          <span className="italic text-muted">Сообщение удалено</span>
        ) : attachment ? (
          <AttachmentContent
            attachment={attachment}
            isMine={message.isMine}
            onImageClick={() => setIsImagePreviewOpen(true)}
          />
        ) : scramble ? (
          <ScrambleText text={message.content} />
        ) : (
          <MessageContent content={message.content} />
        )}
      </div>
      {isImagePreviewOpen && attachment && isImage && (
        <div
          role="dialog"
          aria-label={attachment.name}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setIsImagePreviewOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsImagePreviewOpen(false)}
            className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-white/15 text-2xl text-white"
            aria-label="Закрыть изображение"
          >
            ×
          </button>
          <img
            src={attachment.url}
            alt={attachment.name}
            className="max-h-[90vh] max-w-[95vw] object-contain"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
      <div
        className={cn(
          "flex items-center gap-1 mt-1",
          message.isMine ? "self-end" : "self-start",
        )}
      >
        <span className="text-[11px] text-muted">
          {formatMessageTime(message.createdAt)}
        </span>
        {message.editedAt && !message.isDeleted && (
          <span className="text-[11px] text-muted">изменено</span>
        )}
        {message.isMine && message.isRead !== undefined && (
          <ReadReceipt isRead={message.isRead} />
        )}
      </div>
    </div>
  );
};

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
      {message.consultationId ? (
        <Link
          href={`/consultation/${message.consultationId}`}
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
        </Link>
      ) : url ? (
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
      ) : null}
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
  // Проявлять новые входящие сообщения прокруткой букв. Включено у чата с
  // ассистентом; в переписке с живым человеком расшифровка выглядела бы как
  // помеха, а не как эффект.
  animateIncoming?: boolean;
  emptyHint: string;
  error?: null | string;
  isLoading: boolean;
  messages: ChatThreadMessage[];
  onDeleteMessages?: (messageIds: number[]) => void;
  onEditMessage?: (message: ChatThreadMessage) => void;
  pendingReply?: boolean;
  selectedMessageIds?: number[];
  onSelectMessage?: (message: ChatThreadMessage) => void;
  onClearSelection?: () => void;
};

export const MessageThread: FC<Props> = ({
  messages,
  isLoading,
  emptyHint,
  error,
  animateIncoming = false,
  pendingReply = false,
  onDeleteMessages,
  onEditMessage,
  selectedMessageIds = [],
  onSelectMessage,
  onClearSelection,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);
  const [contextMessage, setContextMessage] =
    useState<ChatThreadMessage | null>(null);
  const contextPositionRef = useRef({ x: 0, y: 0 });
  const selectionMode = selectedMessageIds.length > 0;

  useEffect(() => {
    if (!contextMessage) return;
    const close = () => setContextMessage(null);
    document.addEventListener("click", close);
    document.addEventListener("scroll", close, true);
    return () => {
      document.removeEventListener("click", close);
      document.removeEventListener("scroll", close, true);
    };
  }, [contextMessage]);

  const handleContextMenu = (
    event: React.MouseEvent,
    message: ChatThreadMessage,
  ) => {
    if (!onDeleteMessages && !onEditMessage) return;
    event.preventDefault();
    setContextMessage(message);
    contextPositionRef.current = {
      x: Math.min(event.clientX, window.innerWidth - 190),
      y: Math.min(event.clientY, window.innerHeight - 130),
    };
  };
  const deleteFromMenu = () => {
    if (!contextMessage || !onDeleteMessages) return;
    const ids = selectedMessageIds.includes(contextMessage.id)
      ? selectedMessageIds
      : [contextMessage.id];
    setContextMessage(null);
    onDeleteMessages(ids);
  };

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
    <div className="relative flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-3 scrollbar-hide bg-white">
      {selectionMode && (
        <div className="sticky top-0 z-10 -mx-2 mb-1 flex items-center justify-between rounded-xl bg-white/95 px-3 py-2 shadow-sm backdrop-blur">
          <span className="text-sm font-medium">
            Выбрано: {selectedMessageIds.length}
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onDeleteMessages?.(selectedMessageIds)}
              className="text-sm font-medium text-primary"
            >
              Удалить
            </button>
            <button
              type="button"
              onClick={onClearSelection}
              className="text-sm text-muted"
            >
              Отмена
            </button>
          </div>
        </div>
      )}
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
            <MessageBubble
              message={message}
              scramble={animateIncoming && !message.isMine && !!message.isFresh}
              isSelected={selectedMessageIds.includes(message.id)}
              selectionMode={selectionMode}
              onContextMenu={handleContextMenu}
              onLongPress={(longPressedMessage) =>
                onSelectMessage?.(longPressedMessage)
              }
              onSelect={onSelectMessage}
            />
            {!message.isMine && message.recommendations && (
              <RecommendationCards recommendations={message.recommendations} />
            )}
          </Fragment>
        ),
      )}

      {pendingReply && <TypingBubble />}

      <div ref={bottomRef} />
      {contextMessage && (
        <div
          className="fixed z-50 min-w-44 overflow-hidden rounded-xl border border-border-soft bg-white py-1 shadow-lg"
          style={{
            left: contextPositionRef.current.x,
            top: contextPositionRef.current.y,
          }}
          onClick={(event) => event.stopPropagation()}
        >
          {onEditMessage && !parseAttachment(contextMessage.content) && (
            <button
              type="button"
              onClick={() => {
                onEditMessage(contextMessage);
                setContextMessage(null);
              }}
              className="block w-full px-4 py-2 text-left text-sm hover:bg-background"
            >
              Редактировать
            </button>
          )}
          {onSelectMessage && (
            <button
              type="button"
              onClick={() => {
                onSelectMessage(contextMessage);
                setContextMessage(null);
              }}
              className="block w-full px-4 py-2 text-left text-sm hover:bg-background"
            >
              Выбрать
            </button>
          )}
          {onDeleteMessages && (
            <button
              type="button"
              onClick={deleteFromMenu}
              className="block w-full px-4 py-2 text-left text-sm text-primary hover:bg-background"
            >
              Удалить
            </button>
          )}
        </div>
      )}
    </div>
  );
};
