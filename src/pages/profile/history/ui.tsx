"use client";

import { FC, forwardRef, useEffect, useRef, useState } from "react";

import { useInfiniteQuery, useQueries } from "@tanstack/react-query";

import { MobilePageHeader } from "@/widgets/profile/mobile-header";

import {
  api,
  doctorKeys,
  getProfileAppointments,
  profileKeys,
} from "@/shared/api";
import type { ProfileAppointment } from "@/shared/api";
import { FilterSample, RemoveIcon, SearchIcon } from "@/shared/assets/icons";
import { toMediaUrl } from "@/shared/lib/media";
import { parsePrice } from "@/shared/lib/price";
import { Button, FilterPanel, IconBtn } from "@/shared/ui";
import { SearchInput } from "@/shared/ui/input";
import { SegmentedControl } from "@/shared/ui/segmented-control";

import { Appointment } from "./history/AppointmentCard/model";
import { ProfileHistory } from "./history/ui";

// Внутри вкладки «Прошедшие» отображаются и завершённые, и отменённые записи
// (иначе отменённые не видны нигде); фильтр разделяет их по статусу. На
// «Предстоящих» фильтровать нечего — там все записи в одном статусе.
const STATUS_FILTER_LABELS = {
  completed: "Завершено",
  cancelled: "Отменено",
} as const;
type StatusFilterValue = keyof typeof STATUS_FILTER_LABELS;
const STATUS_FILTER_OPTIONS = Object.values(STATUS_FILTER_LABELS);
const labelToStatus = (label: null | string): null | StatusFilterValue =>
  (Object.keys(STATUS_FILTER_LABELS) as StatusFilterValue[]).find(
    (key) => STATUS_FILTER_LABELS[key] === label,
  ) ?? null;

type FilterButtonProps = {
  isActive: boolean;
  isOpen: boolean;
  onClick: () => void;
};

const FilterButton = forwardRef<HTMLButtonElement, FilterButtonProps>(
  ({ isOpen, isActive, onClick }, ref) => (
    <button
      ref={ref}
      type="button"
      aria-label="Фильтры"
      onClick={onClick}
      className={`w-11 h-11 shrink-0 rounded-full border bg-white flex items-center justify-center hover:bg-surface transition-colors ${
        isOpen || isActive ? "border-primary" : "border-border"
      }`}
    >
      <FilterSample
        className={`w-4.5 h-4.5 ${isOpen || isActive ? "[&_path]:stroke-primary" : ""}`}
      />
    </button>
  ),
);
FilterButton.displayName = "FilterButton";

const TABS = [
  { value: "upcoming" as const, label: "Предстоящие" },
  { value: "completed" as const, label: "Прошедшие" },
];

// Бэк на /api/profile/appointments/ иногда отдаёт doctor/clinic/service
// объектом ({id, full_name}), хотя тип описывает их строкой — рендерить
// объект напрямую в JSX нельзя (React падает с "Objects are not valid as
// a React child"). Достаём отображаемое имя безопасно, с fallback на "".
const toDisplayName = (value: unknown): string => {
  if (typeof value === "string") return value;
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (typeof obj.full_name === "string") return obj.full_name;
    if (typeof obj.name === "string") return obj.name;
  }
  return "";
};

// Из того же объекта достаём id (нужен кнопке «Написать врачу»).
const toEntityId = (value: unknown): string => {
  if (value && typeof value === "object") {
    const id = (value as Record<string, unknown>).id;
    if (typeof id === "number" || typeof id === "string") return String(id);
  }
  return "";
};

// Столько же, сколько отдаёт сервер по умолчанию; остальное — «Показать ещё».
const PAGE_SIZE = 20;

// Фото, специальность и рейтинг врача бэк теперь отдаёт прямо в записи. Пока
// он не обновлён, дочитываем их через api.getDoctorById — тот же адаптированный
// объект и тот же ключ, что у страницы врача, так что кеш у них общий. Адрес
// отсюда не берём: у врача он первой клиники, а не клиники записи.
type DoctorFallback = {
  image?: unknown;
  rating?: number;
  specialty?: string;
};

const needsDoctorFallback = (a: ProfileAppointment): boolean =>
  !!a.doctor && typeof a.doctor === "object" && !("specialty" in a.doctor);

const toRating = (value: unknown): number => {
  const rating = parseFloat(String(value ?? ""));
  return Number.isFinite(rating) ? rating : 0;
};

const toText = (value: unknown): string | undefined =>
  typeof value === "string" && value.trim() ? value : undefined;

// Цена берётся из объекта услуги ({id, name, price}); бэк отдаёт число или
// строку. Если цены нет — undefined, карточка прячет блок стоимости.
const toServicePrice = (value: unknown): number | undefined => {
  if (value && typeof value === "object") {
    return parsePrice((value as Record<string, unknown>).price);
  }
  return undefined;
};

const toServiceDuration = (value: unknown): null | number => {
  if (value && typeof value === "object") {
    const duration = (value as Record<string, unknown>).duration;
    if (typeof duration === "number") return duration;
  }
  return null;
};

export const ProfileHistoryPage: FC = () => {
  const [activeTab, setActiveTab] = useState<"completed" | "upcoming">(
    "upcoming",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilterLabel, setStatusFilterLabel] = useState<null | string>(
    null,
  );
  const statusFilter = labelToStatus(statusFilterLabel);

  // Мобильная и десктопная версии кнопки/панели фильтра рендерятся
  // одновременно (скрываются только через CSS), поэтому у каждой — свой ref;
  // единый ref на обе сломал бы click-away для одной из версий.
  const mobileFilterBtnRef = useRef<HTMLButtonElement>(null);
  const mobileFilterPanelRef = useRef<HTMLDivElement>(null);
  const desktopFilterBtnRef = useRef<HTMLButtonElement>(null);
  const desktopFilterPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!filterOpen) return;
    const refs = [
      mobileFilterBtnRef,
      mobileFilterPanelRef,
      desktopFilterBtnRef,
      desktopFilterPanelRef,
    ];
    const close = (e: MouseEvent) => {
      const target = e.target as Node;
      if (refs.some((ref) => ref.current?.contains(target))) return;
      setFilterOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [filterOpen]);

  const handleTabChange = (tab: "completed" | "upcoming") => {
    setActiveTab(tab);
    setStatusFilterLabel(null);
    setFilterOpen(false);
  };

  // Вкладку отдаёт бэк (tab): в «Предстоящих» только визиты, время которых
  // ещё не прошло, ближайший первым; в «Прошедших» — завершённые, отменённые и
  // просроченные, свежие первыми. Раньше брали status=upcoming: туда попадали
  // давно прошедшие визиты, ближайший оказывался внизу, а дальше первых 20 не
  // было видно ничего. status шлём тоже — старый бэк не знает tab и фильтрует
  // только по нему (на «Прошедших» тогда отсеивает список ниже, по статусу).
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useInfiniteQuery({
      queryKey: profileKeys.appointments({
        tab: activeTab,
        status: activeTab === "upcoming" ? "upcoming" : statusFilter,
      }),
      queryFn: ({ pageParam }) =>
        getProfileAppointments(
          activeTab === "upcoming" ? "upcoming" : (statusFilter ?? undefined),
          pageParam,
          PAGE_SIZE,
          activeTab === "upcoming" ? "upcoming" : "past",
        ),
      initialPageParam: 1,
      getNextPageParam: (lastPage) =>
        lastPage.pagination &&
        lastPage.pagination.page < lastPage.pagination.total_pages
          ? lastPage.pagination.page + 1
          : undefined,
    });

  const rawAppointments = data?.pages.flatMap((page) => page.data) ?? [];

  // Только для старого бэка (в записи нет фото и специальности врача). Ошибку
  // не повторяем и список ею не блокируем: снятый с публикации врач отвечает
  // 404, и раньше вся история секунды висела на «Загрузка...».
  const fallbackDoctorIds = Array.from(
    new Set(
      rawAppointments
        .filter(needsDoctorFallback)
        .map((a) => toEntityId(a.doctor))
        .filter(Boolean),
    ),
  );
  const fallbackQueries = useQueries({
    queries: fallbackDoctorIds.map((id) => ({
      queryKey: doctorKeys.detail(id),
      queryFn: () => api.getDoctorById(id),
      retry: false,
    })),
  });
  const fallbackDoctors = new Map<string, DoctorFallback>();
  fallbackQueries.forEach((q, index) => {
    if (q.data) fallbackDoctors.set(fallbackDoctorIds[index], q.data);
  });

  const appointments: Appointment[] = rawAppointments.map((a) => {
    const docId = toEntityId(a.doctor);
    const doctor = a.doctor && typeof a.doctor === "object" ? a.doctor : null;
    const clinic = a.clinic && typeof a.clinic === "object" ? a.clinic : null;
    const fallback = fallbackDoctors.get(docId);

    return {
      id: String(a.id),
      doctorId: docId,
      clinicId: toEntityId(a.clinic),
      serviceId: toEntityId(a.service),
      serviceDuration: toServiceDuration(a.service),
      doctorName: toDisplayName(a.doctor),
      doctorSpecialty: doctor?.specialty || fallback?.specialty || "",
      // Клиника и адрес — именно этой записи, а не первой клиники врача.
      doctorClinic: toDisplayName(a.clinic),
      doctorRating: toRating(doctor?.rating ?? fallback?.rating),
      // Фото из записи бэк отдаёт по http — приводим, как адаптер врача.
      doctorImage: toMediaUrl(doctor?.photo) || toText(fallback?.image) || "",
      date: a.date,
      time: a.time,
      service: toDisplayName(a.service),
      price: toServicePrice(a.service),
      // У онлайн-консультации физического адреса нет.
      address: a.is_online ? "" : (clinic?.address ?? ""),
      status: a.status,
      isOnline: a.is_online,
      isPast: typeof a.is_past === "boolean" ? a.is_past : undefined,
      canReview: a.can_review === true,
      diagnosis: toText(a.diagnosis),
      recommendations: toText(a.recommendations),
    };
  });

  return (
    <>
      <MobilePageHeader
        title="История записей"
        rightElement={
          <IconBtn
            onClick={() => setMobileSearchOpen((open) => !open)}
            variant="outline"
            size="sm"
            aria-label={mobileSearchOpen ? "Закрыть поиск" : "Открыть поиск"}
          >
            {mobileSearchOpen ? (
              <RemoveIcon className="size-4" />
            ) : (
              <SearchIcon className="size-5" />
            )}
          </IconBtn>
        }
        bottomElement={
          <div className="flex flex-col gap-3">
            {mobileSearchOpen && (
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <SearchInput value={searchQuery} onChange={setSearchQuery} />
                </div>
                {activeTab === "completed" && (
                  <FilterButton
                    ref={mobileFilterBtnRef}
                    isOpen={filterOpen}
                    isActive={!!statusFilterLabel}
                    onClick={() => setFilterOpen((v) => !v)}
                  />
                )}
              </div>
            )}
            {activeTab === "completed" && filterOpen && (
              <div ref={mobileFilterPanelRef}>
                <FilterPanel
                  label="Статус"
                  options={STATUS_FILTER_OPTIONS}
                  selected={statusFilterLabel}
                  onSelect={setStatusFilterLabel}
                />
              </div>
            )}
            <SegmentedControl
              options={TABS}
              value={activeTab}
              onChange={handleTabChange}
            />
          </div>
        }
      />
      <div className="px-4 pt-6 pb-8 md:p-0">
        {/* Desktop: заголовок + поиск с фильтром в одну строку, табы ниже */}
        <div className="hidden md:flex items-center justify-between gap-6 mb-5">
          <h2 className="text-[32px] font-semibold text-foreground">
            История записей
          </h2>
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-80">
              <SearchInput value={searchQuery} onChange={setSearchQuery} />
            </div>
            {activeTab === "completed" && (
              <FilterButton
                ref={desktopFilterBtnRef}
                isOpen={filterOpen}
                isActive={!!statusFilterLabel}
                onClick={() => setFilterOpen((v) => !v)}
              />
            )}
          </div>
        </div>
        <div className="hidden md:block w-75 mb-6">
          <SegmentedControl
            options={TABS}
            value={activeTab}
            onChange={handleTabChange}
          />
        </div>

        {activeTab === "completed" && filterOpen && (
          <div ref={desktopFilterPanelRef} className="hidden md:block">
            <FilterPanel
              label="Статус"
              options={STATUS_FILTER_OPTIONS}
              selected={statusFilterLabel}
              onSelect={setStatusFilterLabel}
            />
          </div>
        )}

        {isLoading ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-border text-muted">
            Загрузка...
          </div>
        ) : (
          <>
            <ProfileHistory
              appointments={appointments}
              activeTab={activeTab}
              searchQuery={searchQuery}
              statusFilter={statusFilter ?? undefined}
            />
            {hasNextPage && (
              <div className="flex justify-center mt-4">
                <Button
                  variant="outline"
                  onClick={() => fetchNextPage()}
                  loading={isFetchingNextPage}
                >
                  {isFetchingNextPage ? "Загрузка…" : "Показать ещё"}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};
