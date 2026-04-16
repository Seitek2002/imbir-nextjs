"use client";

import { FC, useState } from "react";

import Link from "next/link";

import { DoctorCard } from "@/entities";
import { Footer, Header } from "@/widgets";

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
import {
  MOCK_CLINIC,
  MOCK_REVIEWS,
  MOCK_SERVICES,
  MOCK_SPECIALISTS,
} from "@/shared/constants/mocks";
import { cn } from "@/shared/lib/utils";
import { Button, IconBtn } from "@/shared/ui";
import { InfoCard } from "@/shared/ui/info-card/ui";
import { StatsPanel } from "@/shared/ui/stats-panel/ui";

type Props = {
  id: string;
};

export const ClinicDetailsPage: FC<Props> = ({ id }) => {
  console.log("Clinic ID:", id);
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  return (
    <main className="min-h-screen bg-[#F2F3F5] md:bg-white flex flex-col relative pb-20 md:pb-0">
      <div className="hidden md:block">
        <Header />
      </div>

      <div className="flex-1 w-full max-w-350 mx-auto md:px-10 flex flex-col pt-0 md:pt-6 pb-10">
        {/* --- ХЛЕБНЫЕ КРОШКИ (ПК) --- */}
        <div className="hidden md:flex text-sm text-[#686F72] mb-6 items-center gap-2">
          <Link
            href={ROUTES.HOME}
            className="hover:text-[#F5653E] transition-colors"
          >
            Главная
          </Link>
          <span>•</span>
          <Link
            href={ROUTES.CLINICS}
            className="hover:text-[#F5653E] transition-colors"
          >
            Клиники
          </Link>
          <span>•</span>
          {/* ИСПРАВЛЕНО НА MOCK_CLINIC */}
          <span className="text-[#F5653E]">{MOCK_CLINIC.name}</span>
        </div>

        {/* --- ОСНОВНОЙ БЛОК --- */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-10">
          {/* ЛЕВАЯ КОЛОНКА: СЛАЙДЕР/ГАЛЕРЕЯ */}
          <div className="relative w-full md:w-125 lg:w-150 shrink-0-0">
            {/* Шапка для мобилки */}
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

            {/* Слайдер */}
            <div className="flex flex-col gap-4">
              <div className="relative flex overflow-x-auto md:overflow-hidden snap-x snap-mandatory scrollbar-hide h-85 md:h-100 w-full md:rounded-3xl bg-[#E3E4E5]">
                <div className="hidden md:flex absolute inset-0 items-center justify-center text-[#838A8D]">
                  Большое фото {activeImageIdx + 1}
                </div>

                {MOCK_CLINIC.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="md:hidden shrink-0-0 w-full h-full snap-center flex items-center justify-center text-[#838A8D] border-r border-white/20"
                  >
                    Фото {idx + 1}
                  </div>
                ))}
              </div>

              {/* Миниатюры для ПК */}
              <div className="hidden md:flex gap-3 overflow-x-auto scrollbar-hide">
                {MOCK_CLINIC.images.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={cn(
                      "size-20 lg:size-24 rounded-2xl bg-[#E3E4E5] shrink-0-0 cursor-pointer transition-all flex items-center justify-center text-xs text-[#838A8D]",
                      activeImageIdx === idx
                        ? "border-2 border-[#F5653E]"
                        : "border-2 border-transparent hover:border-[#F5653E]/50",
                    )}
                  >
                    Мини {idx + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ПРАВАЯ КОЛОНКА: ИНФОРМАЦИЯ О КЛИНИКЕ */}
          <div className="flex-1 flex flex-col rounded-t-3xl md:rounded-none -mt-6 md:mt-0 relative z-10 p-2 md:p-0">
            <div className="bg-white rounded-[20px] p-4 border border-[#E3E4E5]">
              <div className="flex justify-center md:justify-between items-start mb-6">
                <div>
                  {/* ИСПРАВЛЕНО НА MOCK_CLINIC */}
                  <h1 className="text-2xl md:text-3xl font-semibold text-[#191A1B] mb-1">
                    {MOCK_CLINIC.name}
                  </h1>
                  <p className="text-[#838A8D] text-center lg:text-left text-base mb-4">
                    {MOCK_CLINIC.type}
                  </p>

                  <div className="flex flex-col gap-1.5 text-sm text-[#191A1B]">
                    <div className="flex items-center gap-2">
                      <span className="text-[#F5653E] flex items-center justify-center">
                        <GeoIcon className="size-4" />
                      </span>
                      {MOCK_CLINIC.address}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#F5653E] flex items-center justify-center">
                        <HistoryIcon className="size-4" />
                      </span>
                      {MOCK_CLINIC.schedule}
                    </div>
                  </div>
                </div>
                <IconBtn variant="outline" size="md">
                  <HeartIcon className="size-5" />
                </IconBtn>
              </div>

              {/* ИСПРАВЛЕНО НА MOCK_CLINIC */}
              <StatsPanel
                rating={MOCK_CLINIC.rating}
                experience={`${MOCK_CLINIC.experience} лет`}
                experienceLabel="Опыт"
                reviews={MOCK_CLINIC.reviewsCount}
              />
            </div>

            <div className="hidden md:flex gap-4 mb-10 mt-4">
              <Button
                variant="outline"
                className="flex-1 justify-center bg-[#FFF2F0] border-transparent text-[#F5653E]"
              >
                Офлайн-консультация
              </Button>
              <Button className="flex-1 justify-center">
                Онлайн-консультация
              </Button>
            </div>

            <div className="flex flex-col gap-2 md:gap-10 md:border-none pt-8 md:pt-0">
              {/* ИСПРАВЛЕНО НА MOCK_CLINIC */}
              <InfoCard title="О клинике" expandable lines={3}>
                {MOCK_CLINIC.about}
              </InfoCard>

              {/* ИСПРАВЛЕНО НА MOCK_CLINIC */}
              <InfoCard title="Контакты" expandable={false}>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-[#F5653E]">
                      <HistoryIcon className="size-5" />
                    </span>
                    <span className="text-[#838A8D] text-sm md:text-base">
                      {MOCK_CLINIC.contacts.schedule}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#F5653E]">
                      <GeoIcon className="size-5" />
                    </span>
                    <span className="text-[#838A8D] text-sm md:text-base">
                      {MOCK_CLINIC.contacts.address}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#F5653E]">
                      <PhoneIcon className="size-5" />
                    </span>
                    <span className="text-[#838A8D] text-sm md:text-base">
                      {MOCK_CLINIC.contacts.phone}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#F5653E]">
                      <EmailIcon className="size-5" />
                    </span>
                    <span className="text-[#838A8D] text-sm md:text-base">
                      {MOCK_CLINIC.contacts.email}
                    </span>
                  </div>
                </div>
              </InfoCard>
            </div>
          </div>
        </div>

        {/* --- СЕКЦИЯ: УСЛУГИ --- */}
        <div className="mt-10 md:mt-20 px-4 md:px-0">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h2 className="text-2xl font-semibold text-[#191A1B]">Услуги</h2>
            <div className="hidden md:flex bg-white border border-[#E3E4E5] rounded-full px-4 py-2 w-75">
              <span className="text-[#838A8D] text-sm">🔍 Поиск...</span>
            </div>
            <Link
              href="#"
              className="md:hidden text-[#F5653E] text-sm font-medium hover:underline"
            >
              Все
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {MOCK_SERVICES.map((service) => (
              <div
                key={service.id}
                className="bg-white border border-[#E3E4E5] rounded-2xl p-4 flex flex-col"
              >
                <div className="h-32 bg-[#E3E4E5] rounded-xl mb-4 flex items-center justify-center text-xs text-gray-400">
                  Фото услуги
                </div>
                <h4 className="font-semibold text-[#191A1B]">{service.name}</h4>
                <p className="text-xs text-[#838A8D] mb-2">
                  {service.category}
                </p>
                <div className="flex items-center justify-between mt-auto mb-4">
                  <span className="font-bold text-[#191A1B]">
                    {service.price}
                  </span>
                  <span className="text-xs text-[#838A8D]">
                    ⭐ {service.rating} ({service.reviews})
                  </span>
                </div>
                <Button variant="outline" className="w-full justify-center">
                  Записаться
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* --- СЕКЦИЯ: СПЕЦИАЛИСТЫ --- */}
        <div className="mt-10 md:mt-20 px-4 md:px-0">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h2 className="text-2xl font-semibold text-[#191A1B]">
              Специалисты
            </h2>
            <div className="hidden md:flex bg-white border border-[#E3E4E5] rounded-full px-4 py-2 w-75">
              <span className="text-[#838A8D] text-sm">🔍 Поиск...</span>
            </div>
            <Link
              href="#"
              className="md:hidden text-[#F5653E] text-sm font-medium hover:underline"
            >
              Все
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {MOCK_SPECIALISTS.map((doc) => (
              <DoctorCard key={doc.id} {...doc} variant="vertical" />
            ))}
          </div>
        </div>

        {/* --- СЕКЦИЯ: ОТЗЫВЫ --- */}
        <ReviewsSection
          initialReviews={MOCK_REVIEWS}
          averageRating={MOCK_CLINIC.rating} // <-- ИСПРАВЛЕНО НА MOCK_CLINIC
        />
      </div>

      <div className="hidden md:block">
        <Footer />
      </div>

      {/* Липкая кнопка для мобилки */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-[#E3E4E5] z-50">
        <Button className="w-full justify-center" size="lg">
          Записаться на приём
        </Button>
      </div>
    </main>
  );
};
