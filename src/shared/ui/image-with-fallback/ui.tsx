"use client";

import { ReactNode, useState } from "react";

import Image, { ImageProps } from "next/image";

type Props = Omit<ImageProps, "onError" | "src"> & {
  // Реальные фото приходят из данных и могут отсутствовать — допускаем falsy src.
  src: ImageProps["src"] | null | undefined;
  // Что показать, если картинка не загрузилась (битая ссылка, недоступный CDN) или src отсутствует.
  fallback: ReactNode;
  // Для вызывающих со своим skeleton-до-onLoad стейтом — иначе он остаётся
  // показанным навечно поверх fallback, если картинка так и не загрузилась.
  onError?: () => void;
};

// next/image без обработки ошибок при битом src просто оставляет пустоту.
// Оборачиваем: при ошибке загрузки показываем fallback-заглушку.
export const ImageWithFallback = ({
  fallback,
  src,
  alt,
  onError,
  ...rest
}: Props) => {
  const [errored, setErrored] = useState(false);

  // Сброс ошибки при смене src — через подстройку стейта на рендере
  // (без useEffect, чтобы не спорить с react-hooks/set-state-in-effect).
  const [prevSrc, setPrevSrc] = useState(src);
  if (src !== prevSrc) {
    setPrevSrc(src);
    setErrored(false);
  }

  if (errored || !src) return <>{fallback}</>;

  return (
    <Image
      {...rest}
      src={src}
      alt={alt}
      onError={() => {
        setErrored(true);
        onError?.();
      }}
    />
  );
};
