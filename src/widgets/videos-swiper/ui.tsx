"use client";

import { FC } from "react";

import Link from "next/link";

import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";

import { VideoCard } from "@/entities/video";

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
  return (
    <section className="flex flex-col gap-6 w-full px-4">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1.5">
          <h2 className="font-semibold text-xl md:text-[28px] text-[#191A1B] leading-tight">
            {title}
          </h2>
          {description && (
            <p className="hidden md:block text-sm text-[#686F72]">
              {description}
            </p>
          )}
        </div>

        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="text-sm md:text-base text-[#F5653E] shrink-0-0 hover:opacity-70 transition-opacity mt-1 md:mt-2"
          >
            Все
          </Link>
        )}
      </div>

      <div className="md:hidden">
        <Swiper slidesPerView={1.15} spaceBetween={16} className="pb-2">
          {videos.map((video) => (
            <SwiperSlide key={video.id}>
              <VideoCard
                title={video.title}
                authorName={video.authorName}
                authorRole={video.authorRole}
                thumbnail={video.thumbnail}
                youtubeUrl={video.youtubeUrl}
              />
            </SwiperSlide>
          ))}
        </Swiper>
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
