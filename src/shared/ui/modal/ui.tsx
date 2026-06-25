"use client";

import { FC, ReactNode, useCallback, useEffect, useState } from "react";

import { RemoveIcon } from "@/shared/assets/icons";
import { useScrollLock } from "@/shared/lib/useScrollLock";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

const DURATION = 200;

export const Modal: FC<Props> = ({ isOpen, onClose, title, children }) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsClosing(false);
      onClose();
    }, DURATION);
  }, [onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, handleClose]);

  useScrollLock(isOpen);

  if (!isOpen && !isClosing) return null;

  const state = isClosing ? "closed" : "open";

  return (
    <div className="fixed inset-0 z-100 flex items-end sm:items-center justify-center">
      <div
        className="modal-overlay absolute inset-0 bg-black/40 backdrop-blur-sm"
        data-state={state}
        onClick={handleClose}
      />

      {/* Mobile bottom-sheet */}
      <div
        className="modal-sheet sm:hidden relative bg-white rounded-t-3xl w-full flex flex-col max-h-[90vh] overflow-hidden shadow-xl"
        data-state={state}
      >
        <div className="flex items-center justify-between p-5 border-b border-border-soft">
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors text-muted"
          >
            <RemoveIcon className="size-5" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>

      {/* Desktop centered */}
      <div
        className="modal-panel hidden sm:flex relative bg-white rounded-3xl w-full max-w-md flex-col max-h-[90vh] overflow-hidden shadow-xl"
        data-state={state}
      >
        <div className="flex items-center justify-between p-5 border-b border-border-soft">
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors text-muted"
          >
            <RemoveIcon className="size-5" />
          </button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
