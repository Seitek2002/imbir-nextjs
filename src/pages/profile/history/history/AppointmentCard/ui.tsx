"use client";

import { FC } from "react";

import Link from "next/link";

import {
  CalendarIcon,
  GeoIcon,
  MedicalServiceIcon,
  ReviewsIcon,
  StarIcon,
  VideoCallIcon,
} from "@/shared/assets/icons";
import { Button, ImageWithFallback } from "@/shared/ui";

import {
  formatDateHuman,
  formatDateNumeric,
  formatPrice,
  formatTime,
} from "./lib";
import type { Appointment } from "./model";

type Props = {
  appointment: Appointment;
  onCancel?: (id: string) => void;
  onReview?: (id: string) => void;
  onReschedule?: (id: string) => void;
};

const CalendarEditIcon: FC<{ className?: string }> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className={className}
  >
    <path
      d="M10.5 1.5v2.5M5.5 1.5v2.5M2 6.5h12M3.5 3h9A1.5 1.5 0 0 1 14 4.5v4M2 4.5A1.5 1.5 0 0 1 3.5 3M2 4.5v8A1.5 1.5 0 0 0 3.5 14h4.5M11 14.5l3.5-3.5-1.5-1.5L9.5 13v1.5H11z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ClockIcon: FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M10 6v4l2.5 1.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const CloseIcon: FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 16 16" fill="none">
    <path
      d="M12 4L4 12M4 4L12 12"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

const Price: FC<{ value?: number; className?: string }> = ({
  value,
  className,
}) =>
  value === undefined ? null : (
    <span className={className}>
      {formatPrice(value)} <span className="underline">с</span>
    </span>
  );

// Внутренняя LiveKit-комната — ID записи используется как consultation_id.
const ConsultationButton: FC<{ appointmentId: string; compact?: boolean }> = ({
  appointmentId,
  compact,
}) => {
  const href = `/consultation/${appointmentId}`;

  if (compact) {
    return (
      <Link
        href={href}
        aria-label="Подключиться к онлайн-консультации"
        className="w-11 h-11 rounded-full bg-primary flex items-center justify-center shrink-0 hover:bg-primary-dark transition-colors"
      >
        <VideoCallIcon className="w-4.5 h-4.5 text-white" />
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="px-5 py-2.5 rounded-full bg-primary text-white font-medium text-sm hover:bg-primary-dark transition-colors flex items-center gap-2 whitespace-nowrap"
    >
      <VideoCallIcon className="w-4 h-4" />
      Подключиться
    </Link>
  );
};

export const AppointmentCard: FC<Props> = ({
  appointment,
  onCancel,
  onReview,
  onReschedule,
}) => {
  const isUpcoming = appointment.status === "upcoming";
  const isCompleted = appointment.status === "completed";
  const showCancel = isUpcoming && !!onCancel;
  const showReview = isCompleted && !!onReview;
  // Переносить можно только предстоящие записи и только если знаем врача —
  // свободные слоты запрашиваются именно по нему.
  const showReschedule = isUpcoming && !!onReschedule && !!appointment.doctorId;
  const showConsultation = isUpcoming && appointment.isOnline;

  const meta = (
    <p className="text-muted">
      {appointment.doctorSpecialty}{" "}
      <span className="text-primary">• {appointment.doctorClinic}</span>
    </p>
  );

  const ratingBadge = (size: "sm" | "lg") => (
    <div
      className={
        size === "lg"
          ? "absolute top-3 left-3 flex items-center gap-1 bg-[#FFF0EE] rounded-lg px-2 py-1 shadow-sm"
          : "absolute top-2 left-2 flex items-center gap-0.5 bg-[#FFF0EE] rounded-md px-1.5 py-0.5 shadow-sm"
      }
    >
      <StarIcon
        className={`text-primary ${size === "lg" ? "w-4 h-4" : "w-3 h-3"}`}
      />
      <span
        className={`text-foreground font-semibold ${size === "lg" ? "text-sm" : "text-xs"}`}
      >
        {appointment.doctorRating.toFixed(2)}
      </span>
    </div>
  );

  const photo = (sizes: string, initialCls: string) => (
    <ImageWithFallback
      src={appointment.doctorImage}
      alt={appointment.doctorName}
      fill
      sizes={sizes}
      className="object-cover object-top"
      fallback={
        <div
          className={`w-full h-full flex items-center justify-center text-dim font-semibold ${initialCls}`}
        >
          {appointment.doctorName.charAt(0)}
        </div>
      }
    />
  );

  return (
    <>
      {/* ── Desktop ─────────────────────────────────────────────── */}
      <div className="hidden md:flex bg-white rounded-3xl p-5 border border-border gap-5">
        <div className="relative shrink-0">
          <div className="relative w-44 h-44 rounded-2xl overflow-hidden bg-primary-tint">
            {photo("176px", "text-4xl")}
          </div>
          {ratingBadge("lg")}
        </div>

        <div className="flex-1 min-w-0 pt-1">
          <h3 className="text-foreground font-semibold text-[22px] leading-tight mb-1">
            {appointment.doctorName}
          </h3>
          <div className="text-base mb-5">{meta}</div>

          <div className="flex flex-col gap-3 text-base text-foreground">
            <div className="flex items-center gap-2.5">
              <CalendarIcon className="w-5 h-5 shrink-0 text-primary" />
              <span>{formatDateNumeric(appointment.date)}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ClockIcon className="w-5 h-5 shrink-0 text-primary" />
              <span>{formatTime(appointment.time)}</span>
            </div>
            {appointment.address && (
              <div className="flex items-start gap-2.5">
                <GeoIcon className="w-5 h-5 mt-0.5 shrink-0 [&_path]:stroke-primary" />
                <span className="flex-1">{appointment.address}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end justify-between shrink-0 pt-1">
          <div className="flex flex-col items-end gap-2">
            {showConsultation && (
              <ConsultationButton appointmentId={appointment.id} />
            )}
            {showReschedule && (
              <Button
                onClick={() => onReschedule(appointment.id)}
                variant="text"
                size="sm"
                IconLeft={CalendarEditIcon}
                className="bg-[#FFF0EE] text-primary hover:bg-[#FFE4DE] active:bg-[#FFE4DE]"
              >
                Перенести
              </Button>
            )}
            {showCancel && (
              <Button
                onClick={() => onCancel(appointment.id)}
                variant="text"
                size="sm"
                IconLeft={CloseIcon}
                className="bg-red-50 text-red-500 hover:bg-red-100 active:bg-red-100"
              >
                Отменить
              </Button>
            )}
            {showReview && (
              <Button
                onClick={() => onReview(appointment.id)}
                variant="text"
                size="sm"
                IconLeft={ReviewsIcon}
                className="bg-[#FFF0EE] text-primary hover:bg-[#FFE4DE] active:bg-[#FFE4DE]"
              >
                Оставить отзыв
              </Button>
            )}
          </div>

          <div className="text-right">
            <p className="text-secondary text-lg mb-1">{appointment.service}</p>
            <Price
              value={appointment.price}
              className="text-foreground font-semibold text-[28px]"
            />
          </div>
        </div>
      </div>

      {/* ── Mobile ──────────────────────────────────────────────── */}
      <div className="md:hidden bg-white rounded-3xl p-3 border border-border">
        <div className="flex items-start gap-3 mb-3">
          <div className="relative shrink-0">
            <div className="relative w-28 h-28 rounded-2xl overflow-hidden bg-primary-tint">
              {photo("112px", "text-3xl")}
            </div>
            {ratingBadge("sm")}
          </div>

          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="text-foreground font-semibold text-base leading-tight mb-0.5">
              {appointment.doctorName}
            </h3>
            <div className="text-sm mb-2.5">{meta}</div>

            <div className="flex flex-col gap-1.5 text-sm text-secondary">
              <div className="flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4 shrink-0 [&_path]:stroke-secondary" />
                <span>
                  {formatDateHuman(appointment.date)} •{" "}
                  {formatTime(appointment.time)}
                </span>
              </div>
              <div className="flex items-center gap-1.5 min-w-0">
                <MedicalServiceIcon className="w-4 h-4 shrink-0 [&_path]:stroke-secondary" />
                <span className="truncate">
                  {appointment.service}
                  {appointment.price !== undefined && (
                    <>
                      {" • "}
                      <Price value={appointment.price} />
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-sm text-secondary flex-1 min-w-0 bg-background px-3 py-2.5 rounded-2xl">
            <GeoIcon className="w-4 h-4 shrink-0 [&_path]:stroke-secondary" />
            <span className="flex-1 truncate">{appointment.address}</span>
          </div>

          {showConsultation && (
            <ConsultationButton appointmentId={appointment.id} compact />
          )}
          {showReschedule && (
            <button
              onClick={() => onReschedule(appointment.id)}
              aria-label="Перенести запись"
              className="w-11 h-11 rounded-full border border-border flex items-center justify-center shrink-0 text-primary hover:bg-primary-tint transition-colors"
            >
              <CalendarEditIcon className="w-4.5 h-4.5" />
            </button>
          )}
          {showCancel && (
            <button
              onClick={() => onCancel(appointment.id)}
              className="w-11 h-11 rounded-full border border-border flex items-center justify-center shrink-0 text-primary hover:bg-primary-tint transition-colors"
              aria-label="Отменить"
            >
              <CloseIcon className="w-4.5 h-4.5" />
            </button>
          )}
          {showReview && (
            <button
              onClick={() => onReview(appointment.id)}
              className="w-11 h-11 rounded-full border border-border flex items-center justify-center shrink-0 hover:bg-primary-tint transition-colors"
              aria-label="Оставить отзыв"
            >
              <ReviewsIcon className="w-5 h-5 [&_path]:stroke-primary" />
            </button>
          )}
        </div>
      </div>
    </>
  );
};
