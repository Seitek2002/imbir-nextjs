"use client";

import { FC, useEffect, useRef, useState } from "react";

import Image from "next/image";
import Link from "next/link";

import {
  BannerImage1,
  BannerImage2,
  BannerImage3,
  GridBlue,
  GridFirst,
  GridPinkSlanted,
  GridPinkStraight,
} from "@/shared/assets/images";
import { Button } from "@/shared/ui";

export const Banners: FC = () => {
  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const index = slideRefs.current.indexOf(
            entry.target as HTMLDivElement,
          );
          if (index >= 0) setActive(index);
        });
      },
      { root: track, threshold: 0.6 },
    );

    slideRefs.current.forEach((slide) => {
      if (slide) observer.observe(slide);
    });

    return () => observer.disconnect();
  }, []);

  const goTo = (index: number) => {
    slideRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "start",
    });
  };

  const card1 = (
    <div className="relative flex h-[196px] w-full flex-col justify-between overflow-hidden rounded-[20px] bg-[#FFA18D] p-6 pb-4 md:h-[424px] md:rounded-3xl md:pb-6">
      <div className="relative z-10">
        <h3 className="mb-2 text-[28px] leading-tight font-bold text-white md:text-[32px]">
          100+ процедур
        </h3>
        <p className="text-base leading-tight text-white">
          Все необходимые услуги
          <br />— быстро и удобно
        </p>
      </div>
      <div className="relative z-10 flex justify-start md:justify-end">
        <Link href="/services">
          <Button
            size="lg"
            className="w-44 border-none bg-white text-foreground hover:bg-gray-50 md:w-[156px]"
          >
            Смотреть
          </Button>
        </Link>
      </div>
      <Image
        src={GridFirst}
        alt=""
        className="pointer-events-none absolute top-[100px] right-0 z-1 hidden md:block"
      />
      <Image
        src={BannerImage1}
        alt=""
        className="pointer-events-none absolute bottom-6 left-0 z-0 hidden w-48 object-contain md:block"
      />
    </div>
  );

  const card2 = (
    <div className="relative flex h-[196px] w-full flex-col overflow-hidden rounded-[20px] bg-primary-tint p-6 pb-4 md:h-[424px] md:rounded-3xl md:bg-[#F6F8F5] md:p-8">
      <div className="relative z-10 flex h-full max-w-[360px] flex-col">
        <h3 className="text-[28px] leading-tight font-bold text-foreground md:text-[36px]">
          Онлайн-
          <br className="hidden md:block" />
          консультация
        </h3>
        <p className="mt-1 text-base leading-tight text-secondary md:mt-4 md:max-w-[340px]">
          Свяжитесь с врачом из любой точки
          <br className="md:hidden" /> — быстро, удобно и без ожидания
        </p>
        <div className="mt-auto md:mt-5">
          <Link href="/record">
            <Button size="lg" className="w-48 md:w-44">
              Записаться
            </Button>
          </Link>
        </div>
      </div>
      <Image
        src={GridPinkSlanted}
        alt=""
        className="pointer-events-none absolute bottom-0 left-0 z-0 hidden h-[192px] w-[499px] md:block"
      />
      <Image
        src={GridPinkStraight}
        alt=""
        className="pointer-events-none absolute top-0 right-0 z-0 hidden h-[193px] w-[197px] md:block"
      />
      <Image
        src={BannerImage2}
        alt=""
        className="pointer-events-none absolute right-8 bottom-0 z-0 hidden w-[306px] object-contain md:block"
      />
    </div>
  );

  const card3 = (
    <div className="relative flex h-[196px] w-full flex-col justify-between overflow-hidden rounded-[20px] bg-white p-6 pb-4 md:h-[424px] md:rounded-3xl md:bg-[#F2F3F5] md:pb-6">
      <div className="relative z-10">
        <h3 className="mb-2 text-[28px] leading-tight font-bold text-foreground md:text-[32px]">
          100+
          <br className="hidden md:block" /> специалистов
        </h3>
        <p className="max-w-[280px] text-base leading-tight text-secondary">
          Опытные эксперты для решения ваших задач
        </p>
      </div>
      <div className="relative z-10 flex justify-start">
        <Link href="/specialists">
          <Button
            size="lg"
            variant="outline"
            className="w-44 border-[#FFA18D] bg-white hover:bg-gray-50 md:w-[156px]"
          >
            Смотреть
          </Button>
        </Link>
      </div>
      <Image
        src={GridBlue}
        alt=""
        className="pointer-events-none absolute bottom-0 left-0 z-0 hidden h-[276px] w-[151px] md:block"
      />
      <Image
        src={BannerImage3}
        alt=""
        className="pointer-events-none absolute right-10 bottom-2 z-0 hidden w-50 object-contain md:block"
      />
    </div>
  );

  return (
    <section className="mx-auto w-full max-w-360 px-4 pt-8 pb-0 md:px-10 md:pt-8 md:pb-8">
      <div className="md:hidden">
        <div
          ref={trackRef}
          className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto"
        >
          {[card1, card2, card3].map((card, i) => (
            <div
              key={i}
              ref={(element) => {
                slideRefs.current[i] = element;
              }}
              className="w-full shrink-0 snap-start"
            >
              {card}
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-center gap-2">
          {[0, 1, 2].map((index) => (
            <button
              key={index}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Перейти к баннеру ${index + 1}`}
              aria-current={active === index ? "true" : undefined}
              className={`h-2 rounded-full transition-all duration-300 ${
                active === index ? "w-6 bg-muted" : "w-2 bg-border-soft"
              }`}
            />
          ))}
        </div>
      </div>

      <div className="hidden md:grid grid-cols-4 gap-5">
        <div className="col-span-1">{card1}</div>
        <div className="col-span-2">{card2}</div>
        <div className="col-span-1">{card3}</div>
      </div>
    </section>
  );
};
