"use client";

import { FC, useState } from "react";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { HeroAssiatant, HeroAvatar, HeroBg } from "@/shared/assets/images";
import { ROUTES } from "@/shared/config";
import { Button } from "@/shared/ui";

export const Hero: FC = () => {
  const router = useRouter();
  const [symptom, setSymptom] = useState("");

  // Открыть ИИ-помощника без вопроса. Без ?ai=1 это была ссылка на голый
  // /chat — он открывал список переписок и не выбирал ни одну (на десктопе
  // «Выберите чат»), хотя карточка обещает разговор с помощником.
  const assistantHref = `${ROUTES.CHATS}?ai=1`;

  // Передаём вопрос ИИ-помощнику: страница чата читает ?ask и отправляет его
  // автоматически.
  const askAssistant = () => {
    const query = symptom.trim();
    router.push(
      query
        ? `${ROUTES.CHATS}?ask=${encodeURIComponent(query)}`
        : assistantHref,
    );
  };

  return (
    <section className="relative max-w-340 mx-auto mt-6 overflow-hidden rounded-3xl bg-[#FFF0E9] pt-8 px-4 pb-0 md:p-12 md:pb-0 flex flex-col md:block min-h-150">
      <Image
        src={HeroBg}
        alt=""
        priority
        // Decorative full-bleed background (opacity 75) — cap the candidate so
        // mobile doesn't fetch/decode a 3840px image, and drop quality since the
        // detail is invisible under the overlay. This is the LCP element.
        // `blur` paints an instant low-res preview from the static import.
        placeholder="blur"
        sizes="(max-width: 1360px) 100vw, 1360px"
        quality={55}
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
            <Link
              href={assistantHref}
              className="flex items-center gap-3 group cursor-pointer"
            >
              <div className="w-12 h-12 overflow-hidden rounded-full shrink-0">
                <Image
                  src={HeroAssiatant}
                  alt=""
                  sizes="48px"
                  className="w-full h-full object-cover object-top group-hover:opacity-90 transition-opacity"
                />
              </div>
              <p className="text-sm text-secondary leading-tight group-hover:text-primary transition-colors">
                Что вас беспокоит? <br /> Я помогу подобрать вам специалиста
              </p>
            </Link>

            <input
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && askAssistant()}
              placeholder="Опишите, что вас беспокоит…"
              className="w-full px-4 py-2.5 rounded-full border border-border text-sm text-foreground outline-none focus:border-primary transition-colors"
            />

            <div className="flex justify-between items-center">
              <Link
                href={assistantHref}
                className="text-sm text-primary hover:underline font-medium"
              >
                Перейти в чат
              </Link>
              <Button size="sm" onClick={askAssistant}>
                Описать симптомы
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-8 md:mt-0 w-full md:absolute md:bottom-0 md:right-0 flex justify-center md:justify-end items-end z-10 h-87.5 md:h-[90%] pointer-events-none">
          <Image
            src={HeroAvatar}
            alt=""
            priority
            sizes="(max-width: 768px) 100vw, 700px"
            className="w-auto h-full object-contain object-bottom"
          />
        </div>
      </div>
    </section>
  );
};
