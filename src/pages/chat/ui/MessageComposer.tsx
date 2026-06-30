"use client";

import { FC, KeyboardEvent, useState } from "react";

const SendIcon: FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
);

type Props = {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
};

export const MessageComposer: FC<Props> = ({
  onSend,
  disabled = false,
  placeholder = "Введите сообщение",
}) => {
  const [text, setText] = useState("");

  const submit = () => {
    const value = text.trim();
    if (!value || disabled) return;
    onSend(value);
    setText("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      submit();
    }
  };

  return (
    <div className="px-4 py-3 border-t border-border-soft">
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
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
