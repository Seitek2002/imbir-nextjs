import { FC } from "react";

import Image from "next/image";

import { Button } from "@/shared";

import { HeroAvatar, HeroBg } from "@/shared/assets";

export const Hero: FC = () => {
  return (
    <section className="relative m-2 p-4 overflow-hidden h-screen rounded-2xl">
      <div className="">
        <h1 className="font-semibold text-2xl text-[#191A1B]">
          Лучшие специалисты и честные отзывы
        </h1>
        <p className="text-[#686F72] text-base mb-6">
          Свяжитесь со специалистом из любой точки — быстро, удобно и без
          ожидания
        </p>
        <Button size="md">Выбрать специалиста / услугу</Button>
        <div className="border border-[#F5653E] rounded-2xl bg-white flex items-start p-3 gap-3 mt-6">
          <div className="size-14 overflow-hidden rounded-full">
            <Image
              className="size-full object-cover object-top"
              src={HeroAvatar}
              alt=""
            />
          </div>
          <div>
            <p className="text-sm text-[#686F72] mb-3">
              Что вас беспокоит? <br />Я помогу подобрать вам специалиста
            </p>
            <div className="flex justify-end">
              <Button size="sm">Описать симптомы</Button>
            </div>
          </div>
        </div>
        <Image className="object-contain" src={HeroAvatar} alt="" />
      </div>
      <div className="w-full h-screen absolute -z-1 top-0 left-0">
        <Image className="object-cover h-full w-full" src={HeroBg} alt="" />
      </div>
    </section>
  );
};
