"use client";

import { FC, ReactNode, useCallback, useEffect, useState } from "react";

import { useScrollLock } from "@/shared/lib/useScrollLock";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  icon?: ReactNode;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

const DURATION = 200;

export const ConfirmDialog: FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  icon,
  title,
  description,
  confirmLabel = "Удалить",
  cancelLabel = "Отмена",
}) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, DURATION);
  }, [onClose]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, handleClose]);

  useScrollLock(isOpen);

  if (!isOpen && !isClosing) return null;

  const state = isClosing ? "closed" : "open";

  return (
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
          <div className="w-14 h-14 rounded-full bg-[#FFF0EE] flex items-center justify-center">
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
              handleClose();
            }}
            className="flex-1 py-3.5 rounded-full bg-primary text-white font-medium text-base hover:bg-primary-dark transition-colors active:scale-95"
          >
            {confirmLabel}
          </button>
        </div>
      </div>

      {/* Desktop centered */}
      <div
        className="modal-panel hidden sm:flex relative bg-white rounded-3xl w-full max-w-sm p-6 flex-col items-center gap-4 shadow-xl"
        data-state={state}
      >
        {icon && (
          <div className="w-16 h-16 rounded-full bg-[#FFF0EE] flex items-center justify-center">
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
              handleClose();
            }}
            className="flex-1 py-3.5 rounded-full bg-primary text-white font-medium text-base hover:bg-primary-dark transition-colors active:scale-95"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
