"use client";

import { FC } from "react";

import Image from "next/image";

import {
  CalendarIcon,
  GeoIcon,
  MedicalServiceIcon,
  ReviewsIcon,
  StarIcon,
  VideoCallIcon,
} from "@/shared/assets/icons";
import { colors } from "@/shared/config";
import { Button, IconBtn } from "@/shared/ui";

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
};

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

const Price: FC<{ value: number; className?: string }> = ({
  value,
  className,
}) => (
  <span className={className}>
    {formatPrice(value)} <span className="underline">с</span>
  </span>
);

// Онлайн-встреча (Google Meet) — доп. действие, только для онлайн-записей.
const GoogleMeetButton: FC<{ href: string; compact?: boolean }> = ({
  href,
  compact,
}) => {
  const shared = {
    href,
    target: "_blank",
    rel: "noopener noreferrer",
  } as const;

  if (compact) {
    return (
      <a
        {...shared}
        aria-label="Подключиться к Google Meet"
        className="w-11 h-11 rounded-full bg-primary flex items-center justify-center shrink-0 hover:bg-primary-dark transition-colors"
      >
        <VideoCallIcon className="w-4.5 h-4.5 text-white" />
      </a>
    );
  }

  return (
    <a
      {...shared}
      className="px-5 py-2.5 rounded-full bg-primary text-white font-medium text-sm hover:bg-primary-dark transition-colors flex items-center gap-2 whitespace-nowrap"
    >
      <VideoCallIcon className="w-4 h-4" />
      Подключиться
    </a>
  );
};

export const AppointmentCard: FC<Props> = ({
  appointment,
  onCancel,
  onReview,
}) => {
  const isUpcoming = appointment.status === "upcoming";
  const isCompleted = appointment.status === "completed";
  const showCancel = isUpcoming && !!onCancel;
  const showReview = isCompleted && !!onReview;
  const showMeet = appointment.isOnline && !!appointment.googleMeetLink;

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
          ? "absolute top-3 left-3 flex items-center gap-1 bg-white rounded-lg px-2 py-1 shadow-sm"
          : "absolute top-2 left-2 flex items-center gap-0.5 bg-white rounded-md px-1.5 py-0.5 shadow-sm"
      }
    >
      <StarIcon className={size === "lg" ? "w-4 h-4" : "w-3 h-3"} />
      <span
        className={`text-primary font-semibold ${size === "lg" ? "text-sm" : "text-xs"}`}
      >
        {appointment.doctorRating.toFixed(2)}
      </span>
    </div>
  );

  const photo = (sizes: string, initialCls: string) =>
    appointment.doctorImage ? (
      <Image
        src={appointment.doctorImage}
        alt={appointment.doctorName}
        fill
        sizes={sizes}
        className="object-cover object-top"
      />
    ) : (
      <div
        className={`w-full h-full flex items-center justify-center text-dim font-semibold ${initialCls}`}
      >
        {appointment.doctorName.charAt(0)}
      </div>
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

          <div className="flex flex-col gap-3 text-base text-secondary">
            <div className="flex items-center gap-2.5">
              <CalendarIcon className="w-5 h-5 shrink-0 [&_path]:stroke-secondary" />
              <span>{formatDateNumeric(appointment.date)}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ClockIcon className="w-5 h-5 shrink-0 text-secondary" />
              <span>{formatTime(appointment.time)}</span>
            </div>
            <div className="flex items-start gap-2.5">
              <GeoIcon className="w-5 h-5 mt-0.5 shrink-0 [&_path]:stroke-secondary" />
              <span className="flex-1">{appointment.address}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end justify-between shrink-0 pt-1">
          <div className="flex flex-col items-end gap-2">
            {showMeet && (
              <GoogleMeetButton href={appointment.googleMeetLink!} />
            )}
            {showCancel && (
              <Button
                onClick={() => onCancel(appointment.id)}
                variant="outline"
                size="sm"
                IconLeft={CloseIcon}
              >
                Отменить
              </Button>
            )}
            {showReview && (
              <Button
                onClick={() => onReview(appointment.id)}
                variant="outline"
                size="sm"
                IconLeft={ReviewsIcon}
              >
                Оставить отзыв
              </Button>
            )}
          </div>

          <div className="text-right">
            <p className="text-muted text-base mb-1">{appointment.service}</p>
            <Price
              value={appointment.price}
              className="text-foreground font-semibold text-2xl"
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
              <div className="flex items-center gap-1.5">
                <MedicalServiceIcon className="w-4 h-4 shrink-0 [&_path]:stroke-secondary" />
                <span>
                  {appointment.service} • <Price value={appointment.price} />
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

          {showMeet && (
            <GoogleMeetButton href={appointment.googleMeetLink!} compact />
          )}
          {showCancel && (
            <IconBtn
              onClick={() => onCancel(appointment.id)}
              variant="outline"
              size="sm"
              aria-label="Отменить"
              style={{ color: colors.primary }}
            >
              <CloseIcon className="w-4.5 h-4.5" />
            </IconBtn>
          )}
          {showReview && (
            <IconBtn
              onClick={() => onReview(appointment.id)}
              variant="outline"
              size="sm"
              aria-label="Оставить отзыв"
            >
              <ReviewsIcon className="w-5 h-5 [&_path]:stroke-primary" />
            </IconBtn>
          )}
        </div>
      </div>
    </>
  );
};
