"use client";

import { FC } from "react";

import Image from "next/image";
import Link from "next/link";

import { Footer, Header, VideosSwiper } from "@/widgets";
import { useQuery } from "@tanstack/react-query";

import { ReviewsSection } from "@/widgets/reviews/ui";

// ИМПОРТЫ API
import { api } from "@/shared/api/requests";
import {
  EmailIcon,
  GeoIcon,
  HeaderBackIcon,
  HeartIcon,
  HistoryIcon,
  PhoneIcon,
} from "@/shared/assets";
import { ROUTES } from "@/shared/config/routes";
import { Button, IconBtn } from "@/shared/ui";
import { InfoCard } from "@/shared/ui/info-card/ui";
import { StatsPanel } from "@/shared/ui/stats-panel/ui";

type Props = {
  id: string;
};

export const SpecialistDetailsPage: FC<Props> = ({ id }) => {
  // 1. ПОЛУЧАЕМ ДАННЫЕ ВРАЧА
  const { data: doctor, isLoading: isDoctorLoading } = useQuery({
    queryKey: ["doctor", id],
    queryFn: () => api.getDoctorById(id),
  });

  // 2. ПОЛУЧАЕМ ОТЗЫВЫ ЭТОГО ВРАЧА
  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", "doctor", id],
    queryFn: () => api.getReviewsByDoctor(id),
  });

  if (isDoctorLoading || !doctor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Загрузка специалиста...
      </div>
    );
  }

  // --- ФОЛЛБЭКИ ДЛЯ ДЕТАЛЬНЫХ ПОЛЕЙ (Пока их нет в MockAPI) ---
  const education =
    doctor.education || "Медицинская Академия, факультет лечебного дела";
  const about =
    doctor.about ||
    "Опытный специалист с многолетней практикой. Индивидуальный подход к каждому пациенту.";
  const workExperience = doctor.workExperience || [
    {
      years: "2015-Наст. время",
      duration: `(${doctor.experience} лет)`,
      place: doctor.workplaces[0]?.clinicName || "Частная клиника",
      role: doctor.specialty,
    },
  ];
  const skills = doctor.skills || [
    "Консультация",
    "Диагностика заболеваний",
    "Назначение плана лечения",
  ];
  const scheduleText = doctor.contacts?.schedule || "ПН-ПТ • 08:00-17:00";
  const phoneText = doctor.contacts?.phone || "+996 700 123 456";
  const emailText = doctor.contacts?.email || "doctor@clinic.kg";

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
          <span className="text-[#F5653E]">{doctor.name}</span>
        </div>

        <div className="flex flex-col md:flex-row gap-6 md:gap-10">
          <div className="relative w-full md:w-100 shrink-0">
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
              {doctor.image && (
                <Image
                  src={doctor.image}
                  alt={doctor.name}
                  fill
                  className="object-cover object-top"
                />
              )}
              {doctor.isOnlineAvailable && (
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
                      {doctor.name}
                    </h1>
                    {doctor.isOnlineAvailable && (
                      <span className="md:hidden bg-green-100 text-green-700 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0 mt-1">
                        Онлайн
                      </span>
                    )}
                  </div>
                  <p className="text-[#838A8D] text-center lg:text-left text-base">
                    {doctor.specialty}
                  </p>

                  <div className="mt-3 flex flex-col gap-1.5">
                    {doctor.workplaces?.map((workplace) => (
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
                rating={doctor.rating}
                experience={`${doctor.experience} лет`}
                experienceLabel="Стаж"
                reviews={doctor.reviews} // Заменил reviewsCount на reviews (по нашему API)
              />
            </div>

            <div className="hidden md:flex gap-4 mb-10 mt-4">
              <Button
                variant="outline"
                className="flex-1 justify-center bg-[#FFF2F0] border-transparent text-[#F5653E]"
              >
                Офлайн-запись
              </Button>
              {doctor.isOnlineAvailable && (
                <Button className="flex-1 justify-center">
                  Видео-консультация
                </Button>
              )}
            </div>

            <div className="flex flex-col gap-2 md:gap-10 md:border-none pt-8 md:pt-0">
              <InfoCard title="Образование" expandable lines={3}>
                {education}
              </InfoCard>
              <InfoCard title="О враче" expandable lines={3}>
                {about}
              </InfoCard>

              <InfoCard title="Опыт работы" expandable={false}>
                <div className="flex flex-col gap-5">
                  {workExperience.map((exp, idx) => (
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
                  {skills.map((skill, idx) => (
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
                      {scheduleText}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#F5653E]">
                      <PhoneIcon className="size-5" />
                    </span>
                    <span className="text-[#838A8D] text-sm md:text-base">
                      {phoneText}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#F5653E]">
                      <EmailIcon className="size-5" />
                    </span>
                    <span className="text-[#838A8D] text-sm md:text-base">
                      {emailText}
                    </span>
                  </div>
                </div>
              </InfoCard>
            </div>
          </div>
        </div>

        {/* Секция отзывов показывается только если есть отзывы */}
        {reviews.length > 0 && (
          <ReviewsSection
            initialReviews={reviews}
            averageRating={doctor.rating}
          />
        )}

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
                authorName: doctor.name,
                authorRole: doctor.specialty,
                thumbnail:
                  typeof doctor.image === "string"
                    ? doctor.image
                    : doctor.image?.src || "",
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
        {doctor.isOnlineAvailable && (
          <Button className="flex-1 justify-center" size="lg">
            Онлайн
          </Button>
        )}
      </div>
    </main>
  );
};
