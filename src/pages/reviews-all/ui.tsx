"use client";

import { FC, ReactNode, useEffect, useMemo, useRef } from "react";

import Link from "next/link";

import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { Footer } from "@/widgets/footer";
import { Header } from "@/widgets/header";
import { ReviewCard } from "@/widgets/reviews";

import { useDeleteReview, useSubmitReview } from "@/features/submit-review";

import {
  api,
  clinicKeys,
  doctorKeys,
  getMyReviews,
  profileKeys,
  reviewKeys,
} from "@/shared/api";
import { ChatIcon, HeaderBackIcon, StarIcon } from "@/shared/assets/icons";
import { ROUTES } from "@/shared/config";
import { useAuthStore } from "@/shared/store";
import { AnimatedNumber, ReviewForm } from "@/shared/ui";

// Столько же, сколько отдаёт сервер по умолчанию. Просим явно, чтобы размер
// страницы не поехал вместе с настройками бэка.
const PAGE_SIZE = 20;

type Props = {
  // Куда возвращает «Назад» — на карточку врача или клиники.
  backHref: string;
  targetId: string;
  targetType: "clinic" | "doctor";
};

const StatCard: FC<{ icon: ReactNode; label: string; value: ReactNode }> = ({
  icon,
  value,
  label,
}) => (
  <div className="flex-1 bg-white border border-border-soft rounded-2xl p-5 flex flex-col gap-3">
    <div className="flex items-center gap-3">
      <div className="bg-[#FFA18D] p-2.5 rounded-xl size-10 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <span className="text-[24px] font-semibold text-foreground">{value}</span>
    </div>
    <span className="text-muted text-sm">{label}</span>
  </div>
);

// Повторяет карточку отзыва, чтобы при подгрузке список не прыгал.
const CardSkeleton: FC = () => (
  <div className="bg-white border border-border-soft rounded-[20px]">
    <div className="p-5 border-b border-border-soft flex flex-col gap-2">
      <div className="h-4 w-full rounded-md skeleton" />
      <div className="h-4 w-4/5 rounded-md skeleton" />
    </div>
    <div className="p-5 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="size-10.5 rounded-full skeleton" />
        <div className="flex flex-col gap-1.5">
          <div className="h-4 w-32 rounded-md skeleton" />
          <div className="h-3 w-20 rounded-md skeleton" />
        </div>
      </div>
      <div className="h-7 w-24 rounded-full skeleton" />
    </div>
  </div>
);

export const AllReviewsPage: FC<Props> = ({
  targetType,
  targetId,
  backHref,
}) => {
  const isAuthed = useAuthStore((state) => Boolean(state.accessToken));
  const currentUserId = useAuthStore((state) => state.user?.id);
  const isDoctor = targetType === "doctor";

  // Карточка цели нужна ради имени в заголовке и средней оценки. Ключ тот же,
  // что на странице врача/клиники, поэтому при переходе оттуда данные уже
  // лежат в кэше и запрос не уходит.
  // Два отдельных запроса, а не один с ветвлением внутри: врач и клиника
  // возвращают разные типы, и общий queryFn пришлось бы приводить к unknown.
  // Лишний запрос не уходит — ненужный выключен через enabled.
  const doctorQuery = useQuery({
    queryKey: doctorKeys.detail(targetId),
    queryFn: () => api.getDoctorById(targetId),
    enabled: isDoctor,
  });
  const clinicQuery = useQuery({
    queryKey: clinicKeys.detail(targetId),
    queryFn: () => api.getClinicById(targetId),
    enabled: !isDoctor,
  });
  const target = isDoctor ? doctorQuery.data : clinicQuery.data;

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isError,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: [...reviewKeys.byTarget(targetType, targetId), "all"],
    queryFn: ({ pageParam }) =>
      api.getReviewsPaginated(targetType, targetId, {
        page: pageParam,
        page_size: PAGE_SIZE,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.page < lastPage.pagination.total_pages
        ? lastPage.pagination.page + 1
        : undefined,
  });

  const total = data?.pages[0]?.pagination.total ?? 0;
  const loaded = useMemo(
    () => data?.pages.flatMap((page) => page.data) ?? [],
    [data],
  );

  // Свой отзыв — первым, как и в блоке на карточке. Здесь список полный, так
  // что промахнуться мимо своей записи из-за пагинации уже нельзя.
  const reviews = useMemo(() => {
    if (currentUserId === undefined) return loaded;

    const mine = loaded.filter((r) => r.authorId === currentUserId);
    if (mine.length === 0) return loaded;

    return [...mine, ...loaded.filter((r) => r.authorId !== currentUserId)];
  }, [loaded, currentUserId]);

  // Есть ли уже мой отзыв на эту цель. Спрашиваем отдельно, а не ищем в
  // загруженных страницах: бэк всё равно откажет дублю, но человек успел бы
  // написать текст впустую.
  const { data: myReviews } = useQuery({
    queryKey: profileKeys.reviews(),
    queryFn: getMyReviews,
    enabled: isAuthed,
  });

  const alreadyReviewed = Boolean(
    myReviews?.data.some(
      (r) =>
        r.target_type === targetType &&
        typeof r.target === "object" &&
        r.target !== null &&
        String(r.target.id) === String(targetId),
    ),
  );

  const { submitReview } = useSubmitReview(targetType, targetId);
  const { removeReview } = useDeleteReview(targetType, targetId);

  // Догружаем по мере прокрутки. Свой наблюдатель, а не useInView: тот
  // отключается после первого срабатывания, а тут нужно поймать каждую
  // следующую страницу.
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasNextPage || isFetchingNextPage) return;
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) fetchNextPage();
      },
      { rootMargin: "200px 0px" },
    );
    observer.observe(node);

    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const targetName = target?.name ?? "";

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <div className="hidden md:block">
        <Header />
      </div>
      <div className="md:hidden">
        <Header title="Отзывы" backTo={backHref} />
      </div>

      <div className="flex-1 w-full max-w-350 mx-auto px-4 md:px-8 pt-4 md:pt-6 pb-10">
        {/* На мобильном стрелка уже стоит в шапке, поэтому здесь только
            десктопный возврат. */}
        <Link
          href={backHref}
          className="hidden md:inline-flex items-center gap-2 text-secondary hover:text-primary transition-colors mb-6"
        >
          <HeaderBackIcon className="size-4" />
          <span className="text-sm font-medium">Назад</span>
        </Link>

        {/* На мобильном слово «Отзывы» уже стоит в шапке — здесь не повторяем. */}
        <h1 className="hidden md:block text-[32px] font-semibold text-foreground">
          Отзывы
        </h1>
        {targetName && (
          <p className="text-muted mt-1 md:mt-1">
            {isDoctor ? "о специалисте" : "о клинике"}{" "}
            <span className="text-foreground font-medium">{targetName}</span>
          </p>
        )}

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 mt-6">
          <div className="w-full lg:w-80 shrink-0 flex flex-col gap-5 lg:sticky lg:top-6 lg:self-start">
            <div className="flex gap-4">
              <StatCard
                icon={<StarIcon className="size-5 text-white" />}
                value={
                  <AnimatedNumber value={target?.rating ?? 0} decimals={2} />
                }
                label="Средняя оценка"
              />
              <StatCard
                icon={<ChatIcon className="size-5 text-white" />}
                value={<AnimatedNumber value={total} />}
                label="Всего отзывов"
              />
            </div>

            {isAuthed && !alreadyReviewed && (
              <div className="bg-white border border-border-soft rounded-2xl p-5">
                <h2 className="font-medium text-xl text-foreground mb-5">
                  Оставьте свой отзыв
                </h2>
                <ReviewForm
                  onSubmit={submitReview}
                  ratingLabel={
                    isDoctor ? "Оцените специалиста" : "Оцените клинику"
                  }
                  commentLabel="Поделитесь своим мнением"
                />
              </div>
            )}

            {isAuthed && alreadyReviewed && (
              <div className="bg-white border border-border-soft border-dashed rounded-2xl p-5 text-center">
                <p className="text-foreground font-medium">
                  Вы уже оставили отзыв
                </p>
                <p className="text-muted text-sm mt-1">
                  Он открывает список. Удалите его, если хотите написать заново.
                </p>
              </div>
            )}

            {!isAuthed && (
              <Link
                href={ROUTES.LOGIN}
                className="bg-white border border-border-soft rounded-2xl p-5 text-center hover:border-primary transition-colors"
              >
                <p className="text-foreground font-medium">
                  Войдите, чтобы оставить отзыв
                </p>
                <p className="text-muted text-sm mt-1">
                  Отзывы можно оставлять только из аккаунта
                </p>
              </Link>
            )}
          </div>

          <div className="flex-1 min-w-0 flex flex-col gap-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
            ) : isError ? (
              <div className="bg-white border border-border-soft rounded-2xl px-6 py-16 text-center text-muted text-sm">
                Не удалось загрузить отзывы. Обновите страницу.
              </div>
            ) : reviews.length === 0 ? (
              <div className="min-h-70 bg-white border border-border-soft border-dashed rounded-2xl flex flex-col items-center justify-center text-center px-6 py-12 gap-3">
                <div className="size-14 rounded-2xl bg-[#FFF0EE] flex items-center justify-center">
                  <ChatIcon className="size-6 text-primary" />
                </div>
                <p className="text-foreground font-medium text-base">
                  Отзывов пока нет
                </p>
                <p className="text-muted text-sm max-w-70">
                  Здесь появятся отзывы после приёма. Оставьте первый — он
                  поможет другим пациентам с выбором.
                </p>
              </div>
            ) : (
              <>
                {reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    author={review.author}
                    date={review.date}
                    text={review.text}
                    rating={review.rating}
                    avatarUrl={review.avatarUrl}
                    reply={review.reply}
                    onDelete={
                      isAuthed &&
                      currentUserId !== undefined &&
                      review.authorId === currentUserId
                        ? () => removeReview(Number(review.id))
                        : undefined
                    }
                  />
                ))}

                {/* Якорь подгрузки: попал в экран — тянем следующую страницу. */}
                <div ref={sentinelRef} />
                {isFetchingNextPage && <CardSkeleton />}
              </>
            )}
          </div>
        </div>
      </div>

      <div className="hidden md:block mt-auto">
        <Footer />
      </div>
    </main>
  );
};
