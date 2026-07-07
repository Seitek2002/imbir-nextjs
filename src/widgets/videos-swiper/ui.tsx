"use client";

import { FC } from "react";

import Link from "next/link";

import { cn } from "@/shared/lib/utils";

import { VideoCard } from "./video/ui";

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
  className?: string;
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
        "flex flex-col gap-6 w-full max-w-360 mx-auto px-4 md:px-10",
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
      <div className="md:hidden flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2">
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
