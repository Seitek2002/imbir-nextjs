"use client";

import { FC, useState } from "react";

import Image from "next/image";
import Link from "next/link";

import { DoctorCard } from "@/entities";
import { Footer, Header } from "@/widgets";
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
import { cn } from "@/shared/lib/utils";
import { Button, IconBtn } from "@/shared/ui";
import { InfoCard } from "@/shared/ui/info-card/ui";
import { StatsPanel } from "@/shared/ui/stats-panel/ui";

type Props = {
  id: string;
};

export const ClinicDetailsPage: FC<Props> = ({ id }) => {
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // 1. ЗАПРАШИВАЕМ ДАННЫЕ ПАРАЛЛЕЛЬНО
  const { data: clinic, isLoading: isClinicLoading } = useQuery({
    queryKey: ["clinic", id],
    queryFn: () => api.getClinicById(id),
  });

  const { data: services = [] } = useQuery({
    queryKey: ["services", "clinic", id],
    // Получаем все услуги и фильтруем те, что принадлежат этой клинике
    queryFn: async () => {
      const allServices = await api.getServices();
      return allServices.filter((s) => s.clinicId === id);
    },
  });

  const { data: doctors = [] } = useQuery({
    queryKey: ["doctors", "clinic", id],
    // Получаем всех врачей и ищем тех, кто работает в этой клинике
    queryFn: async () => {
      const allDoctors = await api.getDoctors();
      return allDoctors.filter((doc) =>
        doc.workplaces.some((w) => w.clinicId === id),
      );
    },
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", "clinic", id],
    queryFn: () => api.getReviewsByClinic(id),
  });

  // ПОКА ГРУЗИТСЯ — ПОКАЗЫВАЕМ ПРОСТОЙ ЛОАДЕР (Можешь заменить на красивый скелетон потом)
  if (isClinicLoading || !clinic) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Загрузка клиники...
      </div>
    );
  }

  // Если у клиники нет детального описания и контактов (в MockAPI мы их пока не добавили всем), ставим заглушки
  const aboutText =
    clinic.about ||
    "Современная медицинская помощь, опытные врачи и индивидуальный подход к каждому пациенту.";
  const scheduleText = clinic.schedule || "ПН-ПТ • 08:00-17:00";
  const phoneText = clinic.phone || "+996 700 123 456";
  const emailText = clinic.email || "info@clinic.kg";

  // Делаем массив картинок (так как в MockAPI у нас пока одна строка image, размножим её для слайдера)
  const images = clinic.images || [clinic.image, clinic.image, clinic.image];

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
            href={ROUTES.CLINICS}
            className="hover:text-[#F5653E] transition-colors"
          >
            Клиники
          </Link>
          <span>•</span>
          <span className="text-[#F5653E]">{clinic.name}</span>
        </div>

        {/* --- ОСНОВНОЙ БЛОК --- */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-10">
          <div className="relative w-full md:w-125 lg:w-150 shrink-0">
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

            <div className="flex flex-col gap-4">
              <div className="relative flex overflow-x-auto md:overflow-hidden snap-x snap-mandatory scrollbar-hide h-85 md:h-100 w-full md:rounded-3xl bg-[#E3E4E5]">
                {/* Главное фото */}
                <Image
                  src={images[activeImageIdx]}
                  alt={clinic.name}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="hidden md:flex gap-3 overflow-x-auto scrollbar-hide">
                {images.map((img: string, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={cn(
                      "relative size-20 lg:size-24 rounded-2xl bg-[#E3E4E5] shrink-0 cursor-pointer transition-all overflow-hidden",
                      activeImageIdx === idx
                        ? "border-2 border-[#F5653E]"
                        : "border-2 border-transparent hover:border-[#F5653E]/50",
                    )}
                  >
                    <Image
                      src={img}
                      alt="thumb"
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col rounded-t-3xl md:rounded-none -mt-6 md:mt-0 relative z-10 p-2 md:p-0">
            <div className="bg-white rounded-[20px] p-4 border border-[#E3E4E5]">
              <div className="flex justify-center md:justify-between items-start mb-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-semibold text-[#191A1B] mb-1">
                    {clinic.name}
                  </h1>
                  <p className="text-[#838A8D] text-center lg:text-left text-base mb-4">
                    Многопрофильная клиника
                  </p>

                  <div className="flex flex-col gap-1.5 text-sm text-[#191A1B]">
                    <div className="flex items-center gap-2">
                      <span className="text-[#F5653E] flex items-center justify-center">
                        <GeoIcon className="size-4" />
                      </span>
                      {clinic.address}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[#F5653E] flex items-center justify-center">
                        <HistoryIcon className="size-4" />
                      </span>
                      {scheduleText}
                    </div>
                  </div>
                </div>
                <IconBtn variant="outline" size="md">
                  <HeartIcon className="size-5" />
                </IconBtn>
              </div>

              <StatsPanel
                rating={clinic.rating}
                experience={`${clinic.experience} лет`}
                experienceLabel="Опыт"
                reviews={clinic.reviews}
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
              <InfoCard title="О клинике" expandable lines={3}>
                {aboutText}
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
                      <GeoIcon className="size-5" />
                    </span>
                    <span className="text-[#838A8D] text-sm md:text-base">
                      {clinic.address}
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

        {/* --- СЕКЦИЯ: УСЛУГИ --- */}
        {services.length > 0 && (
          <div className="mt-10 md:mt-20 px-4 md:px-0">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h2 className="text-2xl font-semibold text-[#191A1B]">Услуги</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="bg-white border border-[#E3E4E5] rounded-2xl p-4 flex flex-col"
                >
                  <div className="relative h-32 bg-[#E3E4E5] rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h4 className="font-semibold text-[#191A1B]">
                    {service.name}
                  </h4>
                  <p className="text-xs text-[#838A8D] mb-2">
                    {service.category}
                  </p>
                  <div className="flex items-center justify-between mt-auto mb-4">
                    <span className="font-bold text-[#191A1B]">
                      {service.price} с
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
        )}

        {/* --- СЕКЦИЯ: СПЕЦИАЛИСТЫ --- */}
        {doctors.length > 0 && (
          <div className="mt-10 md:mt-20 px-4 md:px-0">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h2 className="text-2xl font-semibold text-[#191A1B]">
                Специалисты клиники
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {doctors.map((doc) => (
                <DoctorCard key={doc.id} {...doc} variant="vertical" />
              ))}
            </div>
          </div>
        )}

        {/* --- СЕКЦИЯ: ОТЗЫВЫ --- */}
        {reviews.length > 0 && (
          <ReviewsSection
            initialReviews={reviews}
            averageRating={clinic.rating}
          />
        )}
      </div>

      <div className="hidden md:block">
        <Footer />
      </div>
    </main>
  );
};
