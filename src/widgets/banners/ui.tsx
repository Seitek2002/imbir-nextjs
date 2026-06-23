"use client";

import { FC } from "react";

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/shared";
import "swiper/css";
import "swiper/css/pagination";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { BannerImage1, BannerImage2, BannerImage3 } from "@/shared/assets";
import { colors } from "@/shared/config/tokens";

export const Banners: FC = () => {
  const card1 = (
    <div className="relative bg-[#F49A82] rounded-4xl p-6 md:p-8 h-60 md:h-80 overflow-hidden flex flex-col justify-between w-full">
      <div className="relative z-10">
        <h3 className="text-white text-[28px] md:text-[32px] font-bold leading-tight mb-2">
          100+ процедур
        </h3>
        <p className="text-white/90 text-sm md:text-base max-w-50">
          Все необходимые услуги — быстро и удобно
        </p>
      </div>
      <div className="relative z-10 flex justify-start md:justify-end mt-4">
        <Link href="/services">
          <Button
            size="sm"
            className="bg-white text-foreground border-none hover:bg-gray-50"
          >
            Смотреть
          </Button>
        </Link>
      </div>
      <Image
        src={BannerImage1}
        alt=""
        className="absolute bottom-0 -right-6 md:left-2 md:right-auto w-32.5 md:w-42.5 z-0 object-contain pointer-events-none"
      />
    </div>
  );

  const card2 = (
    <div className="relative bg-surface rounded-4xl p-6 md:p-8 h-60 md:h-80 overflow-hidden flex flex-col justify-center w-full">
      <div className="relative z-10 max-w-[60%] md:max-w-[50%] flex flex-col gap-4 md:gap-5">
        <h3 className="text-foreground text-[28px] md:text-[36px] font-bold leading-tight">
          Онлайн-
          <br />
          консультация
        </h3>
        <p className="text-secondary text-sm md:text-base leading-snug">
          Свяжитесь с врачом из любой точки — быстро, удобно и без ожидания
        </p>
        <div>
          <Link href="/record">
            <Button size="md">Записаться</Button>
          </Link>
        </div>
      </div>
      <Image
        src={BannerImage2}
        alt=""
        className="absolute bottom-0 -right-8 md:right-8 w-40 md:w-65 z-0 object-contain pointer-events-none"
      />
    </div>
  );

  const card3 = (
    <div className="relative bg-[#F2F4F7] rounded-4xl p-6 md:p-8 h-60 md:h-80 overflow-hidden flex flex-col justify-between w-full">
      <div className="relative z-10">
        <h3 className="text-foreground text-[28px] md:text-[32px] font-bold leading-tight mb-2">
          100+
          <br />
          специалистов
        </h3>
        <p className="text-secondary text-sm md:text-base max-w-45">
          Опытные эксперты для решения ваших задач
        </p>
      </div>
      <div className="relative z-10 flex justify-start mt-4">
        <Link href="/specialists">
          <Button
            size="sm"
            variant="outline"
            className="bg-white hover:bg-gray-50"
          >
            Смотреть
          </Button>
        </Link>
      </div>
      <Image
        src={BannerImage3}
        alt=""
        className="absolute bottom-0 -right-6 md:-right-2 w-35 md:w-50 z-0 object-contain pointer-events-none"
      />
    </div>
  );

  return (
    <section className="w-full max-w-360 mx-auto px-4 md:px-10 py-6">
      <div className="md:hidden">
        <Swiper
          modules={[Pagination]}
          pagination={{ clickable: true }}
          spaceBetween={16}
          slidesPerView={1}
          className="pb-10"
          style={
            {
              "--swiper-pagination-color": colors.muted,
              "--swiper-pagination-bullet-inactive-color": colors.borderSoft,
              "--swiper-pagination-bullet-inactive-opacity": "1",
              "--swiper-pagination-bottom": "0px",
            } as React.CSSProperties
          }
        >
          <SwiperSlide>{card1}</SwiperSlide>
          <SwiperSlide>{card2}</SwiperSlide>
          <SwiperSlide>{card3}</SwiperSlide>
        </Swiper>
      </div>

      <div className="hidden md:grid grid-cols-4 gap-5">
        <div className="col-span-1">{card1}</div>
        <div className="col-span-2">{card2}</div>
        <div className="col-span-1">{card3}</div>
      </div>
    </section>
  );
};
