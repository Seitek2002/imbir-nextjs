"use client";

import { FC, KeyboardEvent, useEffect, useRef, useState } from "react";

const PaperclipIcon: FC<{ className?: string }> = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);

const SendIcon: FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
);

// Через сколько тишины в поле снимаем статус "печатает".
const TYPING_IDLE_MS = 2000;

type Props = {
  disabled?: boolean;
  disclaimer?: React.ReactNode;
  onSend: (text: string) => void;
  onSendFiles?: (files: File[]) => Promise<File[] | void> | File[] | void;
  // Сигнал "печатает/перестал" — троттлинг здесь, чтобы не спамить сокет.
  onTyping?: (isTyping: boolean) => void;
  placeholder?: string;
};

export const MessageComposer: FC<Props> = ({
  onSend,
  disabled = false,
  placeholder = "Введите сообщение",
  onTyping,
  disclaimer,
  onSendFiles,
}) => {
  const [text, setText] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSendingFile, setIsSendingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Уже отправили "true" и ждём тишины, чтобы отправить "false".
  const typingActiveRef = useRef(false);
  const idleTimerRef = useRef<null | ReturnType<typeof setTimeout>>(null);

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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length) setSelectedFiles((prev) => [...prev, ...files]);
  };

  const submit = async () => {
    const value = text.trim();
    if ((!value && selectedFiles.length === 0) || disabled || isSendingFile)
      return;
    stopTyping(); // снять статус до отправки
    if (selectedFiles.length > 0 && onSendFiles) {
      setIsSendingFile(true);
      try {
        const failedFiles = await onSendFiles(selectedFiles);
        setSelectedFiles(failedFiles ?? []);
      } catch {
        // Ошибка уже показана владельцем onSendFiles; оставляем файлы выбранными,
        // чтобы пользователь мог повторить отправку.
        return;
      } finally {
        setIsSendingFile(false);
      }
    }
    if (value) onSend(value);
    setText("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      void submit();
    }
  };

  // При размонтировании (смена комнаты) — снять свой статус, погасить таймер.
  useEffect(() => stopTyping, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="px-4 py-3 border-t border-border-soft bg-white">
      {selectedFiles.length > 0 && (
        <div className="mb-2 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {selectedFiles.map((file, index) => (
            <div key={`${file.name}-${index}`} className="w-16 shrink-0">
              <div className="relative">
                <FileThumb file={file} />
                <button
                  type="button"
                  onClick={() =>
                    setSelectedFiles((prev) =>
                      prev.filter((_, fileIndex) => fileIndex !== index),
                    )
                  }
                  className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-white text-[11px] leading-none text-muted shadow-sm"
                  aria-label={`Убрать файл ${file.name}`}
                >
                  ×
                </button>
              </div>
              <span className="mt-1 block truncate text-center text-[10px] text-foreground">
                {file.name}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-full border border-border-soft bg-white py-1.5 pl-4 pr-3 transition-all focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20">
          <input
            type="text"
            value={text}
            onChange={(event) => handleChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isSendingFile}
            className="min-w-0 flex-1 bg-transparent py-1 text-sm text-foreground outline-none placeholder:text-muted"
          />
          {onSendFiles && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileChange}
                className="hidden"
                disabled={disabled || isSendingFile}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || isSendingFile}
                aria-label="Прикрепить файл"
                className="flex items-center justify-center size-8 shrink-0 text-muted hover:text-foreground disabled:opacity-50"
              >
                <PaperclipIcon className="size-5" />
              </button>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={
            (!text.trim() && selectedFiles.length === 0) ||
            disabled ||
            isSendingFile
          }
          aria-label="Отправить сообщение"
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-white transition-colors disabled:bg-border-soft disabled:text-muted"
        >
          {isSendingFile ? (
            <span className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
          ) : (
            <SendIcon className="size-4.5" />
          )}
        </button>
      </div>
      {disclaimer && (
        <p className="mt-2 text-center text-[11px] text-muted leading-tight">
          {disclaimer}
        </p>
      )}
    </div>
  );
};

const isImageFile = (file: File) =>
  file.type.startsWith("image/") ||
  /\.(?:avif|gif|jpe?g|png|svg|webp)$/i.test(file.name);

const FileThumb: FC<{ file: File }> = ({ file }) => {
  const [previewUrl, setPreviewUrl] = useState<string>();

  useEffect(() => {
    if (!isImageFile(file)) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (previewUrl) {
    return (
      <img
        src={previewUrl}
        alt=""
        className="size-14 rounded-xl border border-border-soft object-cover"
      />
    );
  }

  const extension = file.name.split(".").pop()?.slice(0, 4).toUpperCase();
  return (
    <div className="flex size-14 items-center justify-center rounded-xl border border-border-soft bg-background text-[10px] font-semibold text-muted">
      {extension || "FILE"}
    </div>
  );
};
