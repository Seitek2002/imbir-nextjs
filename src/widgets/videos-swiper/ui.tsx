"use client";

import { FC } from "react";

import Link from "next/link";

import { cn } from "@/shared/lib/utils";

import { VideoCard } from "./video/ui";

type Video = {
  authorName: string;
  authorRole: string;
  id: string;
  // У врача может не быть загруженного фото.
  thumbnail?: string;
  title: string;
  youtubeUrl: string;
};

type Props = {
  className?: string;
  description?: string;
  title?: string;
  videos: Video[];
  viewAllHref?: string;
};

export const VideosSwiper: FC<Props> = ({
  title = "Интервью",
  description,
  videos,
  viewAllHref,
  className,
}) => {
  return (
    <section
      className={cn(
        "flex flex-col gap-6 w-full max-w-360 mx-auto px-4 md:px-10 pt-8 pb-0 md:pt-0 md:pb-0",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1.5">
          <h2 className="font-semibold text-xl md:text-[28px] text-foreground leading-tight">
            {title}
          </h2>
          {description && (
            <p className="hidden md:block text-sm text-secondary">
              {description}
            </p>
          )}
        </div>

        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-sm md:text-base text-primary shrink-0 hover:opacity-70 transition-opacity mt-1 md:mt-2"
          >
            Все
          </Link>
        )}
      </div>

      {/* Mobile: native horizontal scroll-snap (no JS carousel lib). Slides are
          ~87% wide so the next one peeks, matching the old slidesPerView 1.15. */}
      <div className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto md:hidden">
        {videos.map((video) => (
          <div key={video.id} className="snap-start shrink-0 w-[87%]">
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

      <div className="hidden md:grid md:grid-cols-3 gap-5">
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
    </section>
  );
};
