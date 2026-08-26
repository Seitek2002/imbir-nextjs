"use client";

import { FC, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import Image from "next/image";

import { RemoveIcon } from "@/shared/assets/icons";
import { useMounted } from "@/shared/lib/useMounted";
import { useScrollLock } from "@/shared/lib/useScrollLock";

type Props = {
  // null — лайтбокс закрыт.
  src: string | null;
  alt?: string;
  onClose: () => void;
};

// Полноразмерный просмотр одной фотографии поверх остального контента —
// открывается кликом по миниатюре. fill+object-contain вместо ширины/высоты
// картинки: реальные размеры загруженных фото заранее не известны.
export const PhotoLightbox: FC<Props> = ({ src, alt = "", onClose }) => {
  const mounted = useMounted();
  useScrollLock(!!src);

  // Полноразмерный вариант обычно ещё не в кеше next/image (миниатюра
  // грузилась под другой размер) — без индикатора при клике какое-то время
  // просто ничего не происходит.
  const [loaded, setLoaded] = useState(false);
  const [prevSrc, setPrevSrc] = useState(src);
  if (src !== prevSrc) {
    setPrevSrc(src);
    setLoaded(false);
  }

  useEffect(() => {
    if (!src) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [src, onClose]);

  if (!mounted || !src) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        aria-label="Закрыть"
      >
        <RemoveIcon className="size-5" />
      </button>

      <div
        className="relative h-[85vh] w-[90vw] max-w-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <svg
              className="size-10 animate-spin text-white"
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
          </div>
        )}
        <Image
          src={src}
          alt={alt}
          fill
          sizes="90vw"
          className="object-contain"
          onLoad={() => setLoaded(true)}
        />
      </div>
    </div>,
    document.body,
  );
};
