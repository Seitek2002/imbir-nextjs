"use client";

import { FC, useEffect, useState } from "react";
import { createPortal } from "react-dom";

import Image from "next/image";

import { RemoveIcon } from "@/shared/assets/icons";
import { useMounted } from "@/shared/lib/useMounted";
import { useScrollLock } from "@/shared/lib/useScrollLock";

import { Spinner } from "../spinner";

type Props = {
  alt?: string;
  onClose: () => void;
  // null — лайтбокс закрыт.
  src: null | string;
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
  const [errored, setErrored] = useState(false);
  const [prevSrc, setPrevSrc] = useState(src);
  if (src !== prevSrc) {
    setPrevSrc(src);
    setLoaded(false);
    setErrored(false);
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
        {!loaded && !errored && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Spinner className="size-10 text-white" />
          </div>
        )}
        {/* Без этой ветки спиннер крутился вечно: onError не обрабатывался,
            loaded так и оставался false, а картинки за ним всё равно нет. */}
        {errored ? (
          <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-white/80">
            Не удалось загрузить фотографию
          </div>
        ) : (
          <Image
            src={src}
            alt={alt}
            fill
            sizes="90vw"
            className="object-contain"
            onLoad={() => setLoaded(true)}
            onError={() => setErrored(true)}
          />
        )}
      </div>
    </div>,
    document.body,
  );
};
