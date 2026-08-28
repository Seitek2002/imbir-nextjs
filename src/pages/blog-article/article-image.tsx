"use client";

import { BlogImageFallback } from "@/entities/blog";

import { ImageWithFallback } from "@/shared/ui";

type Props = {
  alt: string;
  // У статьи с бэка картинки может не быть
  src?: string;
};

export const ArticleImage = ({ src, alt }: Props) => (
  <div className="relative w-full h-64 md:h-105 overflow-hidden rounded-3xl">
    <ImageWithFallback
      src={src}
      alt={alt}
      fill
      // Обложка статьи — самый крупный элемент первого экрана, next/image
      // грузил её лениво и она же оказывалась LCP.
      priority
      sizes="(max-width: 768px) 100vw, 900px"
      className="object-cover"
      fallback={<BlogImageFallback />}
    />
  </div>
);
