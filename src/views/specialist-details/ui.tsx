"use client";

import { FC } from "react";

import Image from "next/image";
import Link from "next/link";

import { Footer, Header, VideosSwiper } from "@/widgets";

import { ReviewsSection } from "@/widgets/reviews/ui";

import {
  EmailIcon,
  GeoIcon,
  HeaderBackIcon,
  HeartIcon,
  HistoryIcon,
  PhoneIcon,
} from "@/shared/assets";
import { ROUTES } from "@/shared/config/routes";
import { MOCK_DOCTOR, MOCK_REVIEWS } from "@/shared/constants/mocks";
import { Button, IconBtn } from "@/shared/ui";
import { InfoCard } from "@/shared/ui/info-card/ui";
import { StatsPanel } from "@/shared/ui/stats-panel/ui";

type Props = {
  id: string;
};

export const SpecialistDetailsPage: FC<Props> = ({ id }) => {
  console.log("Specialist ID:", id);

  return (
    <main className="min-h-screen bg-[#F2F3F5] md:bg-white flex flex-col relative pb-20 md:pb-0">
      <div className="hidden md:block">
        <Header />
      </div>

      <div className="flex-1 w-full max-w-350 mx-auto md:px-10 flex flex-col pt-0 md:pt-6 pb-10">
        <div className="hidden md:flex text-sm text-[#686F72] mb-6 items-center gap-2">
          <Link
            href={ROUTES.HOME}
            className="hover:text-[#F5653E] transition-colors"
          >
            Главная
          </Link>
          <span>•</span>
          <Link
            href={ROUTES.SPECIALISTS}
            className="hover:text-[#F5653E] transition-colors"
          >
            Специалисты
          </Link>
          <span>•</span>
          <span className="text-[#F5653E]">{MOCK_DOCTOR.name}</span>
        </div>

        <div className="flex flex-col md:flex-row gap-6 md:gap-10">
          <div className="relative w-full md:w-100 shrink-0-0">
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 md:hidden">
              <IconBtn
                variant="outline"
                size="sm"
                className="bg-white/80 backdrop-blur"
                onClick={() => window.history.back()}
              >
                <HeaderBackIcon className="size-4" />
              </IconBtn>
              <IconBtn
                variant="outline"
                size="sm"
                className="bg-white/80 backdrop-blur"
              >
                <HeartIcon className="size-5 text-[#FFA18D]" />
              </IconBtn>
            </div>

            <div className="relative w-full h-85 md:h-125 bg-[#FFEFE5] md:rounded-3xl overflow-hidden">
              {/* Вставили реальное фото вместо заглушки */}
              <Image
                src={MOCK_DOCTOR.image}
                alt={MOCK_DOCTOR.name}
                fill
                className="object-cover object-top"
              />
              {/* Бейджик онлайна, если врач доступен онлайн */}
              {MOCK_DOCTOR.isOnlineAvailable && (
                <div className="absolute top-4 left-4 z-20 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm uppercase tracking-wider hidden md:block">
                  Онлайн
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col rounded-t-3xl md:rounded-none -mt-6 md:mt-0 relative z-10 p-2 md:p-0">
            <div className="bg-white rounded-[20px] p-4 border border-[#E3E4E5]">
              <div className="flex justify-center md:justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl md:text-3xl font-semibold text-[#191A1B]">
                      {MOCK_DOCTOR.name}
                    </h1>
                    {/* Мобильный бейджик онлайна */}
                    {MOCK_DOCTOR.isOnlineAvailable && (
                      <span className="md:hidden bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0-0 mt-1">
                        Онлайн
                      </span>
                    )}
                  </div>
                  <p className="text-[#838A8D] text-center lg:text-left text-base">
                    {MOCK_DOCTOR.specialty}
                  </p>

                  {/* ВЫВОДИМ МЕСТА РАБОТЫ (КЛИНИКИ) И ЦЕНЫ */}
                  <div className="mt-3 flex flex-col gap-1.5">
                    {MOCK_DOCTOR.workplaces.map((workplace) => (
                      <div
                        key={workplace.clinicId}
                        className="flex items-center gap-2 text-sm text-[#191A1B]"
                      >
                        <span className="text-[#F5653E]">
                          <GeoIcon className="size-4" />
                        </span>
                        <span>{workplace.clinicName}</span>
                        <span className="text-[#838A8D] ml-auto font-medium">
                          {workplace.price} с
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <IconBtn variant="outline" size="md">
                  <HeartIcon className="size-5" />
                </IconBtn>
              </div>

              <StatsPanel
                rating={MOCK_DOCTOR.rating}
                experience={`${MOCK_DOCTOR.experience} лет`}
                experienceLabel="Стаж"
                reviews={MOCK_DOCTOR.reviewsCount}
              />
            </div>

            {/* Десктопные кнопки */}
            <div className="hidden md:flex gap-4 mb-10 mt-4">
              <Button
                variant="outline"
                className="flex-1 justify-center bg-[#FFF2F0] border-transparent text-[#F5653E]"
              >
                Офлайн-запись
              </Button>
              {MOCK_DOCTOR.isOnlineAvailable && (
                <Button className="flex-1 justify-center">
                  Видео-консультация
                </Button>
              )}
            </div>

            <div className="flex flex-col gap-2 md:gap-10 md:border-none pt-8 md:pt-0">
              <InfoCard title="Образование" expandable lines={3}>
                {MOCK_DOCTOR.education}
              </InfoCard>

              <InfoCard title="О враче" expandable lines={3}>
                {MOCK_DOCTOR.about}
              </InfoCard>

              <InfoCard title="Опыт работы" expandable={false}>
                <div className="flex flex-col gap-5">
                  {MOCK_DOCTOR.workExperience.map((exp, idx) => (
                    <div key={idx} className="relative pl-5">
                      <span className="absolute left-0 top-2.5 w-2.5 h-0.5 bg-[#F5653E]" />
                      <div className="mb-1">
                        <span className="text-[#191A1B] font-medium text-sm md:text-base">
                          {exp.years}{" "}
                        </span>
                        <span className="text-[#F5653E] text-sm md:text-base">
                          {exp.duration}
                        </span>
                      </div>
                      <p className="text-[#191A1B] text-sm md:text-base">
                        {exp.place}
                      </p>
                      <p className="text-[#838A8D] text-sm md:text-base">
                        {exp.role}
                      </p>
                    </div>
                  ))}
                </div>
              </InfoCard>

              <InfoCard title="Профессиональные навыки" expandable={false}>
                <ul className="flex flex-col gap-3">
                  {MOCK_DOCTOR.skills.map((skill, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="text-[#F5653E] font-medium text-lg leading-none mt-0.5">
                        —
                      </span>
                      <span className="text-[#838A8D] text-sm md:text-base leading-relaxed">
                        {skill}
                      </span>
                    </li>
                  ))}
                </ul>
              </InfoCard>

              <InfoCard title="Контакты" expandable={false}>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[#F5653E]">
                      <HistoryIcon className="size-5" />
                    </span>
                    <span className="text-[#838A8D] text-sm md:text-base">
                      {MOCK_DOCTOR.contacts.schedule}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#F5653E]">
                      <PhoneIcon className="size-5" />
                    </span>
                    <span className="text-[#838A8D] text-sm md:text-base">
                      {MOCK_DOCTOR.contacts.phone}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#F5653E]">
                      <EmailIcon className="size-5" />
                    </span>
                    <span className="text-[#838A8D] text-sm md:text-base">
                      {MOCK_DOCTOR.contacts.email}
                    </span>
                  </div>
                </div>
              </InfoCard>
            </div>
          </div>
        </div>

        <ReviewsSection
          initialReviews={MOCK_REVIEWS}
          averageRating={MOCK_DOCTOR.rating}
        />

        <div className="mt-10 md:mt-20 mb-10 md:mb-20 px-4 md:px-0">
          <div className="flex items-center justify-between mb-6 md:mb-8 md:hidden">
            <h2 className="text-2xl font-semibold text-[#191A1B]">Интервью</h2>
            <Link
              href={ROUTES.VIDEOS}
              className="text-[#F5653E] text-sm font-medium hover:underline"
            >
              Все
            </Link>
          </div>

          <VideosSwiper
            title="Интервью"
            viewAllHref={ROUTES.VIDEOS}
            description="Ознакомьтесь с интересными материалами"
            videos={[
              {
                id: "1",
                title: "Врач онлайн: как это работает за 1 минуту",
                authorName: MOCK_DOCTOR.name,
                authorRole: MOCK_DOCTOR.specialty,
                // ИСПРАВЛЕНО: убрал .src, т.к. картинка может быть строкой или StaticImageData
                thumbnail:
                  typeof MOCK_DOCTOR.image === "string"
                    ? MOCK_DOCTOR.image
                    : MOCK_DOCTOR.image?.src || "",
                youtubeUrl: "#",
              },
              {
                id: "2",
                title: "3 шага к консультации с врачом",
                authorName: MOCK_DOCTOR.name,
                authorRole: MOCK_DOCTOR.specialty,
                thumbnail:
                  typeof MOCK_DOCTOR.image === "string"
                    ? MOCK_DOCTOR.image
                    : MOCK_DOCTOR.image?.src || "",
                youtubeUrl: "#",
              },
            ]}
          />
        </div>
      </div>

      <div className="hidden md:block">
        <Footer />
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-[#E3E4E5] z-50 flex gap-2 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
        <Button
          className="flex-1 justify-center bg-[#FFF2F0] text-[#F5653E] border border-transparent"
          size="lg"
        >
          Офлайн
        </Button>
        {MOCK_DOCTOR.isOnlineAvailable && (
          <Button className="flex-1 justify-center" size="lg">
            Онлайн
          </Button>
        )}
      </div>
    </main>
  );
};
