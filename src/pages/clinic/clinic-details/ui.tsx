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

import { useFavoriteToggle } from "@/features/favorite-toggle";

import { DoctorCard } from "@/entities/doctor";
import { ServiceCard } from "@/entities/service";

// ИМПОРТЫ API
import { api, createReview } from "@/shared/api";
import {
  EmailIcon,
  GeoIcon,
  HeaderBackIcon,
  HeartIcon,
  HistoryIcon,
  PhoneIcon,
} from "@/shared/assets/icons";
import { ROUTES } from "@/shared/config";
import { extractErrorMessage } from "@/shared/lib/errors";
import { cn } from "@/shared/lib/utils";
import { useAuthStore } from "@/shared/store";
import { Button, ContactInfoModal, IconBtn } from "@/shared/ui";
import { InfoCard } from "@/shared/ui/info-card";
import { StatsPanel } from "@/shared/ui/stats-panel";

type Props = {
  id: string;
  // Получено на сервере (app/clinics/[id]/page.tsx) и передано как initialData
  // в useQuery — иначе клиент всегда стартует с isLoading=true и на секунду
  // показывает текст "Загрузка клиники..." поверх уже отрисованного skeleton
  // из loading.tsx, даже если данные пришли почти мгновенно.
  initialClinic?: Awaited<ReturnType<typeof api.getClinicById>>;
};

export const ClinicDetailsPage: FC<Props> = ({ id, initialClinic }) => {
  const user = useAuthStore((s) => s.user);
  const isDoctor = user?.role === "doctor";
  const router = useRouter();
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isOfflineInfoOpen, setIsOfflineInfoOpen] = useState(false);
  const { isSaved, toggle } = useFavoriteToggle("clinic");
  const isFavorite = isSaved(Number(id));
  // Услуги и врачи в секциях ниже — свои target_type в /api/profile/favorites/,
  // поэтому хука клиники им недостаточно. Без этих двух карточки рендерились
  // без isSaved/onSave и сердечко на них просто ничего не делало.
  const serviceFavorites = useFavoriteToggle("service");
  const doctorFavorites = useFavoriteToggle("doctor");

  // 1. ЗАПРАШИВАЕМ ДАННЫЕ ПАРАЛЛЕЛЬНО
  const {
    data: clinic,
    isLoading: isClinicLoading,
    isError: isClinicError,
  } = useQuery({
    queryKey: ["clinic", id],
    queryFn: () => api.getClinicById(id),
    initialData: initialClinic,
  });

  const { data: services = [] } = useQuery({
    queryKey: ["services", "clinic", id],
    queryFn: () => api.getServices({ clinic_id: id }),
  });

  const { data: doctors = [] } = useQuery({
    queryKey: ["doctors", "clinic", id],
    queryFn: async () => {
      const allDoctors = await api.getDoctors({ page_size: 100 });
      return allDoctors.filter((doc) =>
        doc.workplaces.some((w) => w.clinicId === id),
      );
    },
  });

  const queryClient = useQueryClient();
  const isAuthed = useAuthStore((s) => Boolean(s.accessToken));
  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews", "clinic", id],
    queryFn: () => api.getReviewsByClinic(id),
  });

  const createReviewMutation = useMutation({
    mutationFn: (vars: { rating: number; text: string }) =>
      createReview({
        target_type: "clinic",
        target_id: Number(id),
        rating: vars.rating,
        text: vars.text,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews", "clinic", id] });
      toast.success("Спасибо за отзыв!");
    },
    onError: (err: unknown) => {
      const data = (err as { response?: { data?: unknown } })?.response?.data;
      toast.error(extractErrorMessage(data, "Не удалось отправить отзыв"));
    },
  });

  if (isClinicError || (!isClinicLoading && !clinic)) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-xl font-semibold text-foreground">
          Клиника не найдена
        </p>
        <Button
          variant="text"
          className="text-primary underline"
          onClick={() => router.push(ROUTES.CLINICS)}
        >
          Вернуться к списку клиник
        </Button>
      </div>
    );
  }

  if (isClinicLoading || !clinic) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Загрузка клиники...
      </div>
    );
  }

  // --- ФОЛЛБЭКИ ТЕКСТОВ ---
  const aboutText =
    clinic.description ||
    "Современная медицинская помощь, опытные врачи и индивидуальный подход к каждому пациенту.";
  const scheduleText = clinic.schedule || "ПН-ПТ • 08:00-17:00";
  const phoneText = clinic.phone || "+996 700 123 456";
  const emailText = clinic.email || "info@clinic.kg";

  // --- ИСПРАВЛЕНИЕ ОШИБКИ С КАРТИНКАМИ ---
  // Создаем дефолтную картинку-заглушку на случай, если с сервера вообще ничего не пришло
  const defaultImg =
    "https://placehold.co/600x400/FFEFE5/F5653E.png?text=Clinic";

  // Гарантируем, что у нас всегда есть валидный src
  const safeImage = clinic.image || defaultImg;

  // Если есть массив images, берем его. Если нет — размножаем safeImage
  const images = clinic.images?.length
    ? clinic.images
    : [safeImage, safeImage, safeImage];

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
            href={ROUTES.CLINICS}
            className="hover:text-primary transition-colors"
          >
            Клиники
          </Link>
          <span>•</span>
          <span className="text-primary">{clinic.name}</span>
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
                aria-label={
                  isFavorite ? "Убрать из сохранённых" : "Сохранить клинику"
                }
                onClick={() => toggle(Number(id))}
              >
                <HeartIcon
                  className={
                    isFavorite
                      ? "size-5 [&_path]:fill-[#FFA18D] [&_path]:stroke-[#FFA18D]"
                      : "size-5 text-[#FFA18D]"
                  }
                />
              </IconBtn>
            </div>

            <div className="flex flex-col gap-4">
              <div className="relative flex overflow-x-auto md:overflow-hidden snap-x snap-mandatory scrollbar-hide h-[392px] md:h-100 w-full md:rounded-3xl md:bg-border-soft gap-3 px-4 md:px-0">
                {/* Mobile scrollable gallery */}
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="md:hidden relative w-[calc(100vw-32px)] h-full shrink-0 snap-start rounded-[20px] overflow-hidden bg-border-soft"
                  >
                    <Image
                      src={img}
                      alt={`${clinic.name}-${idx}`}
                      fill
                      sizes="calc(100vw - 32px)"
                      className="object-cover"
                      priority={idx === 0}
                    />
                  </div>
                ))}

                {/* Desktop static active image */}
                <div className="hidden md:block relative w-full h-full overflow-hidden">
                  <Image
                    src={images[activeImageIdx]}
                    alt={clinic.name}
                    fill
                    sizes="(min-width: 768px) 1320px, 100vw"
                    className="object-cover"
                    priority
                  />
                </div>
              </div>

              <div className="hidden md:flex gap-3 overflow-x-auto scrollbar-hide">
                {/* ИСПРАВЛЕНИЕ: убрал (img: string), позволив TS вывести тип (string | StaticImageData) */}
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={cn(
                      "relative size-20 lg:size-24 rounded-2xl bg-border-soft shrink-0 cursor-pointer transition-all overflow-hidden",
                      activeImageIdx === idx
                        ? "border-2 border-primary"
                        : "border-2 border-transparent hover:border-primary/50",
                    )}
                  >
                    <Image
                      src={img}
                      alt={`thumb-${idx}`}
                      fill
                      sizes="(min-width: 1024px) 96px, 80px"
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex-1 flex flex-col rounded-t-3xl md:rounded-none -mt-6 md:mt-0 relative z-10 p-2 md:p-0">
            <div className="bg-white rounded-[20px] p-4 border border-border-soft">
              <div className="flex justify-center md:justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-2xl md:text-3xl font-semibold text-foreground leading-tight">
                      {clinic.name}
                    </h1>
                  </div>
                  <p className="text-muted text-center lg:text-left text-base mb-4">
                    Многопрофильная клиника
                  </p>

                  <div className="flex flex-col gap-1.5 text-sm text-foreground">
                    <div className="flex items-center gap-2">
                      <span className="text-primary flex items-center justify-center">
                        <GeoIcon className="size-4" />
                      </span>
                      {clinic.address}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-primary flex items-center justify-center">
                        <HistoryIcon className="size-4" />
                      </span>
                      {scheduleText}
                    </div>
                  </div>
                </div>
                <IconBtn
                  variant="outline"
                  size="md"
                  aria-label={
                    isFavorite ? "Убрать из сохранённых" : "Сохранить клинику"
                  }
                  onClick={() => toggle(Number(id))}
                >
                  <HeartIcon
                    className={
                      isFavorite
                        ? "size-5 [&_path]:fill-[#FFA18D] [&_path]:stroke-[#FFA18D]"
                        : "size-5"
                    }
                  />
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
                className="flex-1 justify-center bg-[#FFF2F0] border-transparent text-primary"
                onClick={() => setIsOfflineInfoOpen(true)}
              >
                Офлайн-консультация
              </Button>
              <Button
                className="flex-1 justify-center"
                onClick={() =>
                  router.push(`${ROUTES.RECORD}?clinic=${id}&mode=online`)
                }
              >
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
                    <span className="text-primary">
                      <HistoryIcon className="size-5" />
                    </span>
                    <span className="text-muted text-sm md:text-base">
                      {scheduleText}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-primary">
                      <GeoIcon className="size-5" />
                    </span>
                    <span className="text-muted text-sm md:text-base">
                      {clinic.address}
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

        {/* --- СЕКЦИЯ: ФИЛИАЛЫ --- */}
        {clinic.branches && clinic.branches.length > 0 && (
          <div className="mt-10 md:mt-20 px-4 md:px-0">
            <h2 className="text-2xl font-semibold text-foreground mb-6 md:mb-8">
              Филиалы
            </h2>
            <div className="flex flex-col gap-3 md:grid md:grid-cols-2 lg:grid-cols-3">
              {clinic.branches.map((branch, idx) => (
                <div
                  key={branch.id}
                  className="bg-white border border-border-soft rounded-2xl p-4 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      Филиал №{idx + 1}
                    </span>
                    <span className="text-xs text-primary bg-[#FFF2F0] px-2 py-0.5 rounded-full">
                      {branch.schedule ?? "По записи"}
                    </span>
                  </div>
                  <div className="flex items-start gap-2 text-sm text-secondary">
                    <GeoIcon className="size-4 text-primary mt-0.5 shrink-0" />
                    <span>{branch.address}</span>
                  </div>
                  {branch.phone && (
                    <div className="flex items-center gap-2 text-sm text-secondary">
                      <PhoneIcon className="size-4 text-primary shrink-0" />
                      <span>{branch.phone}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- СЕКЦИЯ: УСЛУГИ --- */}
        {services.length > 0 && (
          <div className="mt-10 md:mt-20 px-4 md:px-0">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h2 className="text-2xl font-semibold text-foreground">Услуги</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  id={service.id}
                  name={service.name}
                  category={service.category}
                  clinic={clinic.name}
                  clinicId={clinic.id}
                  rating={service.rating}
                  reviews={service.reviews}
                  price={service.price}
                  image={service.image}
                  variant="vertical"
                  isSaved={serviceFavorites.isSaved(Number(service.id))}
                  onSave={() => serviceFavorites.toggle(Number(service.id))}
                />
              ))}
            </div>
          </div>
        )}

        {/* --- СЕКЦИЯ: СПЕЦИАЛИСТЫ --- */}
        {doctors.length > 0 && (
          <div className="mt-10 md:mt-20 px-4 md:px-0">
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <h2 className="text-2xl font-semibold text-foreground">
                Специалисты клиники
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {doctors.map((doc) => (
                <DoctorCard
                  key={doc.id}
                  {...doc}
                  variant="vertical"
                  isSaved={doctorFavorites.isSaved(Number(doc.id))}
                  onSave={() => doctorFavorites.toggle(Number(doc.id))}
                  onBook={() =>
                    router.push(
                      ROUTES.RECORD_FOR_DOCTOR(doc.id, { clinicId: id }),
                    )
                  }
                />
              ))}
            </div>
          </div>
        )}

        {/* --- СЕКЦИЯ: ОТЗЫВЫ --- */}
        {(reviews.length > 0 || isAuthed) && (
          <ReviewsSection
            initialReviews={reviews}
            averageRating={clinic.rating}
            onSubmitReview={
              // mutateAsync, а не mutate: форма отзыва должна очиститься
              // только после успешной отправки (см. ReviewsSection).
              isAuthed
                ? (rating, text) =>
                    createReviewMutation.mutateAsync({ rating, text })
                : undefined
            }
            isSubmitting={createReviewMutation.isPending}
          />
        )}
      </div>

      <div className="hidden md:block">
        <Footer />
      </div>

      <ContactInfoModal
        isOpen={isOfflineInfoOpen}
        onClose={() => setIsOfflineInfoOpen(false)}
        title="Офлайн-консультация"
        phone={clinic.phone}
        email={clinic.email}
      />
    </main>
  );
};
