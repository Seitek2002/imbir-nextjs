"use client";

import { FC, KeyboardEvent, useEffect, useRef, useState } from "react";

const SendIcon: FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
);

// Через сколько тишины в поле снимаем статус "печатает".
const TYPING_IDLE_MS = 2000;

type Props = {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  // Сигнал "печатает/перестал" — троттлинг здесь, чтобы не спамить сокет.
  onTyping?: (isTyping: boolean) => void;
};

export const MessageComposer: FC<Props> = ({
  onSend,
  disabled = false,
  placeholder = "Введите сообщение",
  onTyping,
}) => {
  const [text, setText] = useState("");

  // Уже отправили "true" и ждём тишины, чтобы отправить "false".
  const typingActiveRef = useRef(false);
  const idleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopTyping = () => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = null;
    if (typingActiveRef.current) {
      typingActiveRef.current = false;
      onTyping?.(false);
    }
  };

  const handleChange = (value: string) => {
    setText(value);
    if (!onTyping || disabled) return;

    if (value.trim() === "") {
      stopTyping();
      return;
    }
    // "true" шлём один раз при начале ввода, дальше только двигаем таймер покоя.
    if (!typingActiveRef.current) {
      typingActiveRef.current = true;
      onTyping(true);
    }
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(stopTyping, TYPING_IDLE_MS);
  };

  const submit = () => {
    const value = text.trim();
    if (!value || disabled) return;
    stopTyping(); // снять статус до отправки
    onSend(value);
    setText("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submit();
    }
  };

  // При размонтировании (смена комнаты) — снять свой статус, погасить таймер.
  useEffect(() => stopTyping, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="px-4 py-3 border-t border-border-soft">
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={text}
          onChange={(event) => handleChange(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-white border border-border-soft rounded-full px-4 min-h-11.5 text-sm text-foreground outline-none focus:border-primary transition-colors placeholder:text-muted"
        />
        <button
          type="button"
          onClick={submit}
          disabled={!text.trim() || disabled}
          aria-label="Отправить сообщение"
          className="flex items-center justify-center size-11.5 shrink-0 rounded-full bg-primary text-white disabled:bg-border-soft disabled:text-muted transition-colors"
        >
          <SendIcon className="size-5" />
        </button>
      </div>
    </div>
  );
};
