"use client";

import { FC, useRef } from "react";

import Link from "next/link";

import { VideoCard } from "@/entities/video";

import { ArrowLeftIcon, ArrowRightIcon } from "@/shared/assets";

type Video = {
  id: string;
  title: string;
  authorName: string;
  authorRole: string;
  thumbnail: string;
  youtubeUrl: string;
};

type Props = {
  title?: string;
  description?: string;
  videos: Video[];
  viewAllHref?: string;
};

export const VideosSwiper: FC<Props> = ({
  title = "Интервью",
  description,
  videos,
  viewAllHref,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({
      left: dir === "left" ? -340 : 340,
      behavior: "smooth",
    });
  };

  return (
    <section className="py-6 flex flex-col gap-4">
      {/* Заголовок */}
      <div className="px-4 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-xl text-[#191A1B]">{title}</h2>
          {viewAllHref && (
            <Link
              href={viewAllHref}
              className="text-sm text-[#F5653E] shrink-0 hover:opacity-70 transition-opacity"
            >
              Все
            </Link>
          )}
        </div>
        {description && <p className="text-sm text-[#686F72]">{description}</p>}
      </div>

      {/* Мобиль: вертикальный список */}
      <div className="md:hidden flex flex-col gap-3 px-4">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            title={video.title}
            authorName={video.authorName}
            authorRole={video.authorRole}
            thumbnail={video.thumbnail}
            youtubeUrl={video.youtubeUrl}
          />
        ))}
      </div>

      {/* Десктоп: горизонтальный скролл */}
      <div className="hidden md:block relative">
        <button
          onClick={() => scroll("left")}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 cursor-pointer"
          aria-label="Назад"
        >
          <ArrowLeftIcon className="size-10" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto scroll-smooth px-4 pb-1"
          style={{ scrollbarWidth: "none" }}
        >
          {videos.map((video) => (
            <div key={video.id} className="w-80 shrink-0">
              <VideoCard
                title={video.title}
                authorName={video.authorName}
                authorRole={video.authorRole}
                thumbnail={video.thumbnail}
                youtubeUrl={video.youtubeUrl}
              />
            </div>
          ))}
        </div>

        <button
          onClick={() => scroll("right")}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 cursor-pointer"
          aria-label="Вперёд"
        >
          <ArrowRightIcon className="size-10" />
        </button>
      </div>
    </section>
  );
};
