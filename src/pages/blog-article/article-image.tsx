"use client";

import { useState } from "react";

import { BlogImageFallback } from "@/entities/blog";

import { ImageWithFallback } from "@/shared/ui";

type Props = {
  alt: string;
  // У статьи с бэка картинки может не быть
  src?: string;
};

export const ArticleImage = ({ src, alt }: Props) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className="relative w-full h-64 md:h-105 overflow-hidden rounded-3xl">
      {!loaded && <div className="absolute inset-0 skeleton" />}
      <ImageWithFallback
        src={src}
        alt={alt}
        fill
        // Обложка статьи — самый крупный элемент первого экрана, next/image
        // грузил её лениво и она же оказывалась LCP.
        priority
        sizes="(max-width: 768px) 100vw, 900px"
        className="object-cover"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
        fallback={<BlogImageFallback />}
      />
    </div>
  );
};
