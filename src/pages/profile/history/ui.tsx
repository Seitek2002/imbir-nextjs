"use client";

import { FC, forwardRef, useEffect, useRef, useState } from "react";

import { useQueries, useQuery } from "@tanstack/react-query";

import { MobilePageHeader } from "@/widgets/profile/mobile-header";

import {
  getDoctorById,
  getProfileAppointments,
  profileKeys,
} from "@/shared/api";
import { FilterSample, RemoveIcon, SearchIcon } from "@/shared/assets/icons";
import { parsePrice } from "@/shared/lib/price";
import { FilterPanel, IconBtn } from "@/shared/ui";
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
const labelToStatus = (label: string | null): StatusFilterValue | null =>
  (Object.keys(STATUS_FILTER_LABELS) as StatusFilterValue[]).find(
    (key) => STATUS_FILTER_LABELS[key] === label,
  ) ?? null;

type FilterButtonProps = {
  isOpen: boolean;
  isActive: boolean;
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

// Подмножество полей врача из getDoctorById, которые нужны карточке записи
// (специальность, рейтинг, фото, адрес клиники/места работы).
type DoctorDetails = {
  specialty?: string;
  rating?: string | number;
  photo?: string;
  clinic?: { name?: string; address?: string };
  workplaces?: Array<{ address?: string }>;
};

// Цена берётся из объекта услуги ({id, name, price}); бэк отдаёт число или
// строку. Если цены нет — undefined, карточка прячет блок стоимости.
const toServicePrice = (value: unknown): number | undefined => {
  if (value && typeof value === "object") {
    return parsePrice((value as Record<string, unknown>).price);
  }
  return undefined;
};

export const ProfileHistoryPage: FC = () => {
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed">(
    "upcoming",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilterLabel, setStatusFilterLabel] = useState<string | null>(
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

  const handleTabChange = (tab: "upcoming" | "completed") => {
    setActiveTab(tab);
    setStatusFilterLabel(null);
    setFilterOpen(false);
  };

  const { data, isLoading: isAppointmentsLoading } = useQuery({
    queryKey: profileKeys.appointments({ status: activeTab }),
    queryFn: () => getProfileAppointments(activeTab),
  });

  // Отменённые записи не подпадают ни под "Предстоящие", ни под "Прошедшие"
  // на бэке — без этого запроса они не видны нигде. Показываем их вместе с
  // завершёнными на вкладке "Прошедшие", а фильтр по статусу разделяет их.
  const { data: cancelledData, isLoading: isCancelledLoading } = useQuery({
    queryKey: profileKeys.appointments({ status: "cancelled" }),
    queryFn: () => getProfileAppointments("cancelled"),
    enabled: activeTab === "completed",
  });

  const rawAppointments = [
    ...(data?.data ?? []),
    ...(activeTab === "completed" ? (cancelledData?.data ?? []) : []),
  ];
  const doctorIds = Array.from(
    new Set(rawAppointments.map((a) => toEntityId(a.doctor)).filter(Boolean)),
  );

  const doctorQueries = useQueries({
    queries: doctorIds.map((id) => ({
      queryKey: ["doctor", id],
      queryFn: () => getDoctorById(id),
      staleTime: 5 * 60 * 1000,
    })),
  });

  const isDoctorsLoading = doctorQueries.some((q) => q.isLoading);
  const isLoading =
    isAppointmentsLoading ||
    (activeTab === "completed" && isCancelledLoading) ||
    isDoctorsLoading;

  const doctorsMap = new Map<string, DoctorDetails>();
  doctorQueries.forEach((q, index) => {
    if (q.data) {
      doctorsMap.set(doctorIds[index], q.data as DoctorDetails);
    }
  });

  const appointments: Appointment[] = rawAppointments.map((a) => {
    const docId = toEntityId(a.doctor);
    const doctorDetails = doctorsMap.get(docId);

    let address = "";
    if (doctorDetails?.clinic?.address) {
      address = doctorDetails.clinic.address;
    } else if (
      Array.isArray(doctorDetails?.workplaces) &&
      doctorDetails.workplaces[0]?.address
    ) {
      address = doctorDetails.workplaces[0].address;
    }

    return {
      id: String(a.id),
      doctorId: docId,
      doctorName: toDisplayName(a.doctor),
      doctorSpecialty: doctorDetails?.specialty || "",
      doctorClinic:
        toDisplayName(a.clinic) || doctorDetails?.clinic?.name || "",
      doctorRating: doctorDetails?.rating
        ? parseFloat(String(doctorDetails.rating)) || 0
        : 0,
      doctorImage: doctorDetails?.photo || "",
      date: a.date,
      time: a.time,
      service: toDisplayName(a.service),
      price: toServicePrice(a.service),
      address,
      status:
        a.status === "confirmed" || a.status === "pending"
          ? "upcoming"
          : a.status,
      isOnline: a.is_online,
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
          <ProfileHistory
            appointments={appointments}
            activeTab={activeTab}
            searchQuery={searchQuery}
            statusFilter={statusFilter ?? undefined}
          />
        )}
      </div>
    </>
  );
};
