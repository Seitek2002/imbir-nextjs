"use client";

import { FC, useState } from "react";

import { StaticImageData } from "next/image";

import { ImageWithFallback } from "@/shared/ui";

type Props = {
  title: string;
  authorName: string;
  authorRole: string;
  thumbnail: StaticImageData | string;
  youtubeUrl: string;
};

export const VideoCard: FC<Props> = ({
  title,
  authorName,
  authorRole,
  thumbnail,
  youtubeUrl,
}) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <a
      href={youtubeUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-white rounded-3xl border border-[#D8DCE0] p-2 flex flex-col w-full h-auto md:h-89.25 shrink-0 hover:shadow-[0_6px_20px_rgba(0,0,0,0.05)] transition-shadow duration-300"
    >
      <div className="relative w-full aspect-video md:aspect-auto md:h-55 shrink-0 overflow-hidden rounded-2xl bg-background">
        {!loaded && <div className="absolute inset-0 skeleton" />}
        <ImageWithFallback
          src={thumbnail}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, 440px"
          className="object-cover"
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
          fallback={<div className="absolute inset-0 bg-surface" />}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="size-12 rounded-full bg-white/90 flex items-center justify-center shadow-md pl-0.5">
            <svg
              viewBox="0 0 24 24"
              className="size-5 fill-primary stroke-primary"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 5.14v14l11-7-11-7z"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 flex-1 px-2 pt-3 pb-2 md:px-4 md:pt-4 md:pb-3">
        <p
          className="font-medium text-base md:text-[18px] text-foreground leading-snug overflow-hidden"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {title}
        </p>

        <div className="flex items-center gap-2 text-xs md:text-sm text-secondary">
          <svg
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
            className="size-4 shrink-0 text-primary"
            fill="none"
            aria-hidden="true"
          >
            <ellipse
              cx="10"
              cy="14.583"
              rx="5.833"
              ry="2.917"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <circle
              cx="10"
              cy="5.833"
              r="3.333"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
          <span className="truncate text-[#313A45]">{authorName}</span>
          <span className="shrink-0">•</span>
          <span className="truncate">{authorRole}</span>
        </div>
      </div>
    </a>
  );
};
