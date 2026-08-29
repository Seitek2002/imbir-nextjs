"use client";

import { ReactNode, useState } from "react";

import Image, { ImageProps } from "next/image";

import { cn } from "@/shared/lib/utils";

import { Spinner } from "../spinner";

type Props = Omit<ImageProps, "onError" | "src"> & {
  // Что показать, если картинка не загрузилась (битая ссылка, недоступный CDN) или src отсутствует.
  fallback: ReactNode;
  // Отключить скелетон на время загрузки. Нужно там, где картинка появляется
  // из уже готовых данных (превью выбранного файла через FileReader) —
  // мигать плашкой там не за чем.
  loadingVariant?: "skeleton" | "spinner";
  noSkeleton?: boolean;
  // Для вызывающих со своим skeleton-до-onLoad стейтом — иначе он остаётся
  // показанным навечно поверх fallback, если картинка так и не загрузилась.
  onError?: () => void;
  // Реальные фото приходят из данных и могут отсутствовать — допускаем falsy src.
  src: ImageProps["src"] | null | undefined;
};

// У картинки четыре состояния, и раньше компонент знал только про два.
//
//   1. загрузилась    — показываем;
//   2. грузится       — скелетон (было: пустота, и каждый вызывающий городил
//                       свой useState + оверлей, либо не городил вовсе —
//                       из 47 вызовов состояние загрузки было в 12);
//   3. ошибка         — заглушка;
//   4. src не пришёл  — та же заглушка (это не ошибка, а просто отсутствие
//                       данных, но рисуется одинаково).
//
// Всё это держим внутри: снаружи забыть onError и оставить скелетон висеть
// навсегда больше нельзя — именно так и ломалось в photo-lightbox.
export const ImageWithFallback = ({
  fallback,
  src,
  alt,
  className,
  noSkeleton = false,
  onError,
  onLoad,
  loadingVariant = "skeleton",
  ...rest
}: Props) => {
  const [errored, setErrored] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Сброс состояния при смене src — через подстройку стейта на рендере
  // (без useEffect, чтобы не спорить с react-hooks/set-state-in-effect).
  const [prevSrc, setPrevSrc] = useState(src);
  if (src !== prevSrc) {
    setPrevSrc(src);
    setErrored(false);
    setLoaded(false);
  }

  if (errored || !src) return <>{fallback}</>;

  // data:-URL — это превью только что выбранного файла, оно уже в памяти.
  // Ждать нечего, скелетон только мигнул бы на один кадр.
  const isInlineData = typeof src === "string" && src.startsWith("data:");
  const showSkeleton =
    !loaded && loadingVariant === "skeleton" && !noSkeleton && !isInlineData;

  const image = (
    <Image
      {...rest}
      src={src}
      alt={alt}
      // Скелетон — фоном самой картинки, поэтому не нужен ни оверлей, ни
      // позиционированный родитель: работает и с fill, и с width/height.
      className={cn(className, showSkeleton && "img-skeleton")}
      onLoad={(event) => {
        setLoaded(true);
        onLoad?.(event);
      }}
      onError={() => {
        setErrored(true);
        // Скелетон снимаем и на ошибке: иначе он остался бы висеть
        // вечно, если картинка так и не пришла.
        setLoaded(true);
        onError?.();
      }}
    />
  );

  if (!loaded && loadingVariant === "spinner" && !noSkeleton && !isInlineData) {
    return (
      <span
        className={
          rest.fill ? "absolute inset-0 block" : "relative inline-block"
        }
        aria-busy="true"
      >
        <span className="absolute inset-0 z-10 flex items-center justify-center bg-[#e5e7eb]">
          <Spinner className="text-secondary" />
        </span>
        {image}
      </span>
    );
  }

  return image;
};
