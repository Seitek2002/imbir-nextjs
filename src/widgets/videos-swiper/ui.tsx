"use client";

import { FC } from "react";

import Link from "next/link";

import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

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
  return (
    <section className="flex flex-col gap-6 w-full px-4">
      {/* Шапка блока */}
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
            className="text-sm md:text-base text-[#F5653E] shrink-0 hover:opacity-70 transition-opacity mt-1 md:mt-2"
          >
            Все
          </Link>
        )}
      </div>

      {/* Единый Swiper для всех экранов */}
      <div className="relative group">
        {/* Кастомная кнопка НАЗАД (Скрыта на мобилке) */}
        <button className="videos-prev hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-10 items-center justify-center cursor-pointer transition-transform bg-white rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.08)] disabled:opacity-50 disabled:cursor-not-allowed">
          <ArrowLeftIcon className="size-10" />
        </button>

        <Swiper
          modules={[Navigation]}
          navigation={{
            prevEl: ".videos-prev",
            nextEl: ".videos-next",
          }}
          // --- ИЗМЕНЕНИЯ ЗДЕСЬ ---
          // Базовые настройки (для мобилки < 768px):
          // Показываем 1 целую карточку и 15% следующей
          slidesPerView={1.15}
          spaceBetween={16}
          // Настройки для планшетов и ПК
          breakpoints={{
            768: {
              slidesPerView: 2, // Начиная с планшета (где появляются стрелки) показываем ровно 2
              spaceBetween: 20,
            },
            1024: {
              slidesPerView: 3, // На ПК ровно 3
              spaceBetween: 20,
            },
          }}
          className="pb-2"
        >
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

        {/* Кастомная кнопка ВПЕРЕД (Скрыта на мобилке) */}
        <button className="videos-next hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 items-center justify-center cursor-pointer transition-transform bg-white rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.08)] disabled:opacity-50 disabled:cursor-not-allowed">
          <ArrowRightIcon className="size-10" />
        </button>
      </div>
    </section>
  );
};
