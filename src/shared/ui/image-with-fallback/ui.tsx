"use client";

import { ReactNode, useState } from "react";

import Image, { ImageProps } from "next/image";

type Props = Omit<ImageProps, "onError"> & {
  // Что показать, если картинка не загрузилась (битая ссылка, недоступный CDN).
  fallback: ReactNode;
};

// next/image без обработки ошибок при битом src просто оставляет пустоту.
// Оборачиваем: при ошибке загрузки показываем fallback-заглушку.
export const ImageWithFallback = ({ fallback, src, alt, ...rest }: Props) => {
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
    <Image {...rest} src={src} alt={alt} onError={() => setErrored(true)} />
  );
};
