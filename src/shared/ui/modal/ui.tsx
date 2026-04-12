"use client";

import { FC, ReactNode, useEffect } from "react";

import { RemoveIcon } from "@/shared/assets";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

export const Modal: FC<Props> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Блокируем скролл страницы при открытой модалке
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-3xl w-full max-w-md flex flex-col max-h-[90vh] overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-[#E3E4E5]">
          <h2 className="text-xl font-semibold text-[#191A1B]">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors text-[#838A8D]"
          >
            <RemoveIcon className="size-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
