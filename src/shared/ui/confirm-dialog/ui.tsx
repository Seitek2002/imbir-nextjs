"use client";

import { FC, ReactNode, useEffect } from "react";

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
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-3xl w-full max-w-sm p-6 flex flex-col items-center gap-4 shadow-xl">
        {icon && (
          <div className="w-16 h-16 rounded-full bg-[#FFF0EE] flex items-center justify-center">
            {icon}
          </div>
        )}

        <div className="text-center">
          <h2 className="text-lg font-bold text-[#191A1B]">{title}</h2>
          {description && (
            <p className="text-sm text-[#838A8D] mt-1.5 leading-snug">
              {description}
            </p>
          )}
        </div>

        <div className="flex gap-3 w-full mt-2">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-full border border-[#E3E4E5] text-[#191A1B] font-medium text-base hover:bg-[#F2F3F5] transition-colors active:scale-95"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-3.5 rounded-full bg-[#F5653E] text-white font-medium text-base hover:bg-[#E0532D] transition-colors active:scale-95"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
