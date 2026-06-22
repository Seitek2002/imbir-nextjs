import { FC } from "react";

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/shared";

import { HeroAvatar, HeroBg } from "@/shared/assets";

export const Hero: FC = () => {
  return (
    <section className="relative max-w-340 mx-auto mt-6 overflow-hidden rounded-3xl bg-[#FFF0E9] pt-8 px-4 pb-0 md:p-12 md:pb-0 flex flex-col md:block min-h-150">
      <Image
        src={HeroBg}
        alt=""
        priority
        className="absolute inset-0 w-full h-full object-cover opacity-75"
      />

      <div className="relative z-10 w-full max-w-300 mx-auto h-full flex flex-col md:flex-row justify-between">
        <div className="flex flex-col items-start w-full md:w-1/2 z-20">
          <h1 className="font-semibold text-[32px] leading-[1.1] md:text-5xl text-foreground mb-3 md:mb-5">
            Лучшие специалисты <br className="hidden md:block" /> и честные
            отзывы
          </h1>

          <p className="text-secondary text-sm md:text-lg mb-6 md:mb-8 max-w-[320px] md:max-w-112.5">
            Свяжитесь со специалистом из любой точки — быстро, удобно и без
            ожидания
          </p>

          <Link href="/specialists" className="w-full md:w-auto mb-6 md:mb-16">
            <Button size="md" className="w-full justify-center">
              Выбрать специалиста / услугу
            </Button>
          </Link>

          <div className="border border-primary rounded-3xl bg-white p-4 w-full md:w-105 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 overflow-hidden rounded-full shrink-0">
                <Image
                  src={HeroAvatar}
                  alt=""
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <p className="text-sm text-secondary leading-tight">
                Что вас беспокоит? <br /> Я помогу подобрать вам специалиста
              </p>
            </div>
            <div className="flex justify-end">
              <Link href="/search">
                <Button size="sm">Описать симптомы</Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 md:mt-0 w-full md:absolute md:bottom-0 md:right-0 flex justify-center md:justify-end items-end z-10 h-87.5 md:h-[90%] pointer-events-none">
          <Image
            src={HeroAvatar}
            alt=""
            priority
            className="w-auto h-full object-contain object-bottom"
          />
        </div>
      </div>
    </section>
  );
};
