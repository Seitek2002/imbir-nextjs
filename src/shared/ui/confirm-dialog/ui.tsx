"use client";

import { FC, ReactNode, useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { useMounted } from "@/shared/lib/useMounted";
import { useScrollLock } from "@/shared/lib/useScrollLock";

type Props = {
  cancelLabel?: string;
  // true (по умолчанию, как сейчас у всех вызовов) — модалка закрывается сама
  // сразу после клика на confirm. Для async-подтверждения с isLoading родитель
  // сам решает, когда закрыть (меняя isOpen после ответа) — передайте false.
  closeOnConfirm?: boolean;
  confirmLabel?: string;
  description?: string;
  icon?: ReactNode;
  // Пока ждём ответ на onConfirm — гасим модалку серой вуалью со спиннером и
  // блокируем закрытие (оверлей, Escape, кнопки), чтобы не словить повторный
  // сабмит или закрытие посреди запроса.
  isLoading?: boolean;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  // "danger" — для необратимых удалений (красный акцент вместо оранжевого).
  variant?: "danger" | "default";
};

const DURATION = 200;

const Spinner = () => (
  <svg
    className="animate-spin size-8 text-foreground"
    viewBox="0 0 24 24"
    fill="none"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
    />
  </svg>
);

export const ConfirmDialog: FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  icon,
  title,
  description,
  confirmLabel = "Удалить",
  cancelLabel = "Отмена",
  variant = "default",
  isLoading = false,
  closeOnConfirm = true,
}) => {
  const isDanger = variant === "danger";
  const iconWrapClass = isDanger
    ? "bg-red-50 text-red-500"
    : "bg-[#FFF0EE] text-primary";
  const confirmBtnClass = isDanger
    ? "bg-red-500 hover:bg-red-600"
    : "bg-primary hover:bg-primary-dark";
  const [isClosing, setIsClosing] = useState(false);
  const mounted = useMounted();

  const handleClose = useCallback(() => {
    if (isLoading) return;
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, DURATION);
  }, [onClose, isLoading]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, handleClose]);

  useScrollLock(isOpen);

  if (!mounted || (!isOpen && !isClosing)) return null;

  const state = isClosing ? "closed" : "open";

  return createPortal(
    <div className="fixed inset-0 z-200 flex items-end sm:items-center justify-center">
      <div
        className="modal-overlay absolute inset-0 bg-black/40 backdrop-blur-sm"
        data-state={state}
        onClick={handleClose}
      />

      {/* Mobile bottom-sheet */}
      <div
        className="modal-sheet sm:hidden relative bg-white rounded-t-3xl w-full p-6 pb-8 flex flex-col items-center gap-4"
        data-state={state}
      >
        {icon && (
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center ${iconWrapClass}`}
          >
            {icon}
          </div>
        )}
        <div className="text-center">
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          {description && (
            <p className="text-sm text-muted mt-1.5 leading-snug">
              {description}
            </p>
          )}
        </div>
        <div className="flex gap-3 w-full mt-2">
          <button
            onClick={handleClose}
            className="flex-1 py-3.5 rounded-full border border-border-soft text-foreground font-medium text-base hover:bg-background transition-colors active:scale-95"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm();
              if (closeOnConfirm) handleClose();
            }}
            className={`flex-1 py-3.5 rounded-full text-white font-medium text-base transition-colors active:scale-95 ${confirmBtnClass}`}
          >
            {confirmLabel}
          </button>
        </div>

        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-t-3xl bg-white/70 backdrop-blur-[1px]">
            <Spinner />
          </div>
        )}
      </div>

      {/* Desktop centered */}
      <div
        className="modal-panel hidden sm:flex relative bg-white rounded-3xl w-full max-w-sm p-6 flex-col items-center gap-4 shadow-xl"
        data-state={state}
      >
        {icon && (
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center ${iconWrapClass}`}
          >
            {icon}
          </div>
        )}
        <div className="text-center">
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          {description && (
            <p className="text-sm text-muted mt-1.5 leading-snug">
              {description}
            </p>
          )}
        </div>
        <div className="flex gap-3 w-full mt-2">
          <button
            onClick={handleClose}
            className="flex-1 py-3.5 rounded-full border border-border-soft text-foreground font-medium text-base hover:bg-background transition-colors active:scale-95"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm();
              if (closeOnConfirm) handleClose();
            }}
            className={`flex-1 py-3.5 rounded-full text-white font-medium text-base transition-colors active:scale-95 ${confirmBtnClass}`}
          >
            {confirmLabel}
          </button>
        </div>

        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-white/70 backdrop-blur-[1px]">
            <Spinner />
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
};
