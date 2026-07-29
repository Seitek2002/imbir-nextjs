"use client";

import { FC, useState } from "react";
import toast from "react-hot-toast";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Footer } from "@/widgets/footer";
import { Header } from "@/widgets/header";
import { ReviewsSection } from "@/widgets/reviews";
import { VideosSwiper } from "@/widgets/videos-swiper";

import { StartChatButton } from "@/features/start-chat";

// ИМПОРТЫ API
import { api, createReview, getBlogPosts } from "@/shared/api";
import {
  EmailIcon,
  GeoIcon,
  HeaderBackIcon,
  HeartIcon,
  HistoryIcon,
  PhoneIcon,
  UserCircleIcon,
} from "@/shared/assets/icons";
import { ROUTES } from "@/shared/config";
import { extractErrorMessage } from "@/shared/lib/errors";
import { useAuthStore } from "@/shared/store";
import { Button, ContactInfoModal, IconBtn } from "@/shared/ui";
import { InfoCard } from "@/shared/ui/info-card";
import { StatsPanel } from "@/shared/ui/stats-panel";

type Props = {
  id: string;
  // Получено на сервере (app/specialists/[id]/page.tsx) и передано как
  // initialData в useQuery — иначе клиент всегда стартует с isLoading=true и
  // на секунду показывает текст "Загрузка специалиста..." поверх уже
  // отрисованного skeleton'а из loading.tsx, даже если данные пришли почти
  // мгновенно.
  initialDoctor?: Awaited<ReturnType<typeof api.getDoctorById>>;
};

export const SpecialistDetailsPage: FC<Props> = ({ id, initialDoctor }) => {
  const router = useRouter();
  const [isOfflineInfoOpen, setIsOfflineInfoOpen] = useState(false);

  // 1. ПОЛУЧАЕМ ДАННЫЕ ВРАЧА
  const {
    data: doctor,
    isLoading: isDoctorLoading,
    isError: isDoctorError,
  } = useQuery({
    queryKey: ["doctor", id],
    queryFn: () => api.getDoctorById(id),
    initialData: initialDoctor,
  });

  // 2. ПОЛУЧАЕМ ОТЗЫВЫ ЭТОГО ВРАЧА
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isDoctor = user?.role === "doctor";
  const isAuthed = useAuthStore((s) => Boolean(s.accessToken));
  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", "doctor", id],
    queryFn: () => api.getReviewsByDoctor(id),
  });

  const createReviewMutation = useMutation({
    mutationFn: (vars: { rating: number; text: string }) =>
      createReview({
        target_type: "doctor",
        target_id: Number(id),
        rating: vars.rating,
        text: vars.text,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", "doctor", id] });
      toast.success("Спасибо за отзыв!");
    },
    onError: (err: unknown) => {
      const data = (err as { response?: { data?: unknown } })?.response?.data;
      toast.error(extractErrorMessage(data, "Не удалось отправить отзыв"));
    },
  });

  // 3. ПОЛУЧАЕМ ПОСТЫ БЛОГА ДЛЯ СЕКЦИИ «ИНТЕРВЬЮ»
  const { data: blogData } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: () => getBlogPosts({ page_size: 3 }),
  });
  const blogVideos = (blogData?.data ?? []).map((post) => ({
    id: String(post.id),
    title: post.title,
    authorName: post.category.name,
    authorRole: post.category.name,
    thumbnail: post.image ?? "",
    youtubeUrl: `/blog/${post.slug}`,
  }));

  if (isDoctorError || (!isDoctorLoading && !doctor)) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-xl font-semibold text-foreground">
          Специалист не найден
        </p>
        <button
          className="text-primary underline text-sm"
          onClick={() => router.push(ROUTES.SPECIALISTS)}
        >
          Вернуться к списку специалистов
        </button>
      </div>
    );
  }

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
  const workExperience =
    doctor.workExperience && doctor.workExperience.length > 0
      ? doctor.workExperience
      : [
          {
            years: "2015-Наст. время",
            duration: `(${doctor.experience} лет)`,
            place: doctor.workplaces[0]?.clinicName || "Частная клиника",
            role: doctor.specialty,
          },
        ];
  const skills =
    doctor.skills && doctor.skills.length > 0
      ? doctor.skills
      : ["Консультация", "Диагностика заболеваний", "Назначение плана лечения"];
  const scheduleText = doctor.contacts?.schedule || "ПН-ПТ • 08:00-17:00";
  const phoneText = doctor.contacts?.phone || "+996 700 123 456";
  const emailText = doctor.contacts?.email || "doctor@clinic.kg";

  return (
    <main className="min-h-screen bg-background md:bg-white flex flex-col relative pb-20 md:pb-0">
      <div className="hidden md:block">
        <Header />
      </div>

      <div className="flex-1 w-full max-w-350 mx-auto md:px-10 flex flex-col pt-0 md:pt-6 pb-10">
        <div className="hidden md:flex text-sm text-secondary mb-6 items-center gap-2">
          <Link
            href={ROUTES.HOME}
            className="hover:text-primary transition-colors"
          >
            Главная
          </Link>
          <span>•</span>
          <Link
            href={ROUTES.SPECIALISTS}
            className="hover:text-primary transition-colors"
          >
            Специалисты
          </Link>
          <span>•</span>
          <span className="text-primary">{doctor.name}</span>
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

            <div className="relative w-full h-85 md:h-125 bg-[#FFEFE5] md:rounded-3xl overflow-hidden flex items-center justify-center">
              {doctor.image ? (
                <Image
                  src={doctor.image}
                  alt={doctor.name}
                  fill
                  // Это LCP-элемент страницы (виден сразу, без скролла) —
                  // без priority next/image ставит loading="lazy" и браузер
                  // не начинает грузить фото, пока JS до него не дойдёт.
                  // Подтверждено Lighthouse: ~1.3с чистой задержки на LCP.
                  priority
                  sizes="(min-width: 768px) 400px, 100vw"
                  className="object-cover object-top"
                />
              ) : (
                <UserCircleIcon className="size-32 text-dim/60" />
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col rounded-t-3xl md:rounded-none -mt-6 md:mt-0 relative z-10 p-2 md:p-0">
            <div className="bg-white rounded-[20px] p-4 border border-border-soft">
              <div className="flex justify-center md:justify-between items-start mb-6">
                <div>
                  <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-1">
                    {doctor.name}
                  </h1>
                  <p className="text-muted text-center lg:text-left text-base">
                    {doctor.specialty}
                  </p>

                  <div className="mt-3 flex flex-col gap-1.5">
                    {doctor.workplaces?.map((workplace) => (
                      <div
                        key={workplace.clinicId}
                        className="flex items-center gap-2 text-sm text-foreground"
                      >
                        <span className="text-primary">
                          <GeoIcon className="size-4" />
                        </span>
                        <span>{workplace.clinicName}</span>
                        <span className="text-muted ml-auto font-medium">
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
              {!isDoctor && (
                <>
                  <Button
                    variant="outline"
                    size="md"
                    className="flex-1 justify-center bg-[#FFF2F0] border-transparent text-primary hover:bg-[#FFEAE5]"
                    onClick={() => setIsOfflineInfoOpen(true)}
                  >
                    Офлайн-запись
                  </Button>
                  {doctor.isOnlineAvailable && (
                    <Button
                      className="flex-1 justify-center"
                      size="md"
                      onClick={() =>
                        router.push(
                          ROUTES.RECORD_FOR_DOCTOR(id, {
                            workplaces: doctor.workplaces,
                            mode: "online",
                          }),
                        )
                      }
                    >
                      Онлайн консультация
                    </Button>
                  )}
                </>
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
                      <span className="absolute left-0 top-2.5 w-2.5 h-0.5 bg-primary" />
                      <div className="mb-1">
                        <span className="text-foreground font-medium text-sm md:text-base">
                          {exp.years}{" "}
                        </span>
                        <span className="text-primary text-sm md:text-base">
                          {exp.duration}
                        </span>
                      </div>
                      <p className="text-foreground text-sm md:text-base">
                        {exp.place}
                      </p>
                      <p className="text-muted text-sm md:text-base">
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
                      <span className="text-primary font-medium text-lg leading-none mt-0.5">
                        —
                      </span>
                      <span className="text-muted text-sm md:text-base leading-relaxed">
                        {skill}
                      </span>
                    </li>
                  ))}
                </ul>
              </InfoCard>

              <InfoCard title="Контакты" expandable={false}>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-primary">
                      <HistoryIcon className="size-5" />
                    </span>
                    <span className="text-muted text-sm md:text-base">
                      {scheduleText}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-primary">
                      <PhoneIcon className="size-5" />
                    </span>
                    <span className="text-muted text-sm md:text-base">
                      {phoneText}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-primary">
                      <EmailIcon className="size-5" />
                    </span>
                    <span className="text-muted text-sm md:text-base">
                      {emailText}
                    </span>
                  </div>
                </div>
              </InfoCard>
            </div>
          </div>
        </div>

        {/* Секция отзывов: форма доступна авторизованным, список — всегда */}
        {(reviews.length > 0 || isAuthed) && (
          <ReviewsSection
            initialReviews={reviews}
            averageRating={doctor.rating}
            onSubmitReview={
              isAuthed
                ? (rating, text) =>
                    createReviewMutation.mutate({ rating, text })
                : undefined
            }
            isSubmitting={createReviewMutation.isPending}
          />
        )}

        <div className="mt-10 md:mt-20 mb-10 md:mb-20 px-4 md:px-0">
          <div className="flex items-center justify-between mb-6 md:mb-8 md:hidden">
            <h2 className="text-2xl font-semibold text-foreground">Интервью</h2>
            <Link
              href={ROUTES.VIDEOS}
              className="text-primary text-sm font-medium hover:underline"
            >
              Все
            </Link>
          </div>

          {blogVideos.length > 0 && (
            <VideosSwiper
              title="Интервью"
              viewAllHref={ROUTES.VIDEOS}
              description="Ознакомьтесь с интересными материалами"
              videos={blogVideos}
              className="px-0 md:px-0"
            />
          )}
        </div>
      </div>

      <div className="hidden md:block">
        <Footer />
      </div>

      {!isDoctor && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white p-4 border-t border-border-soft z-50 flex gap-2 shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
          <Button
            className="flex-1 justify-center bg-[#FFF2F0] text-primary border border-transparent"
            size="lg"
            onClick={() => setIsOfflineInfoOpen(true)}
          >
            Офлайн
          </Button>
          {doctor.isOnlineAvailable && (
            <Button
              className="flex-1 justify-center"
              size="lg"
              onClick={() =>
                router.push(`${ROUTES.RECORD}?doctor=${id}&mode=online`)
              }
            >
              Онлайн консультация
            </Button>
          )}
        </div>
      )}

      <ContactInfoModal
        isOpen={isOfflineInfoOpen}
        onClose={() => setIsOfflineInfoOpen(false)}
        title="Офлайн-запись"
        phone={doctor.contacts?.phone}
        email={doctor.contacts?.email}
      />
    </main>
  );
};
