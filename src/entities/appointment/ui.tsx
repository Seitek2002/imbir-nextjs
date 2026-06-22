"use client";

import { FC } from "react";

import Image from "next/image";

import {
  CalendarIcon,
  GeoIcon,
  MedicalServiceIcon,
  StarIcon,
} from "@/shared/assets";

import type { Appointment } from "./model";

type Props = {
  appointment: Appointment;
  onCancel?: (id: string) => void;
  onReview?: (id: string) => void;
};

export const AppointmentCard: FC<Props> = ({
  appointment,
  onCancel,
  onReview,
}) => {
  return (
    <>
      {/* Desktop */}
      <div className="hidden md:flex bg-white rounded-3xl p-5 border border-border items-start gap-4">
        <div className="relative shrink-0">
          <div className="relative w-50 h-50 rounded-2xl overflow-hidden bg-primary-tint">
            {appointment.doctorImage ? (
              <Image
                src={appointment.doctorImage}
                alt={appointment.doctorName}
                fill
                sizes="200px"
                className="object-cover object-top scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-dim text-4xl font-semibold">
                {appointment.doctorName.charAt(0)}
              </div>
            )}
          </div>
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-white rounded-lg px-2 py-1 shadow-sm">
            <StarIcon className="w-4 h-4 text-primary" />
            <span className="text-primary font-semibold text-sm">
              {appointment.doctorRating}
            </span>
          </div>
        </div>

        <div className="flex-1 min-w-0 pt-1">
          <h3 className="text-foreground font-semibold text-xl leading-tight mb-2">
            {appointment.doctorName}
          </h3>
          <p className="text-muted text-base mb-5">
            {appointment.doctorSpecialty}{" "}
            <span className="text-primary">• {appointment.doctorClinic}</span>
          </p>
          <div className="flex flex-col gap-2.5 text-base text-secondary">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 shrink-0 [&_path]:stroke-secondary" />
              <span>
                {appointment.date} • {appointment.time}
              </span>
            </div>
            <div className="flex items-start gap-2">
              <GeoIcon className="w-5 h-5 mt-0.5 shrink-0 [&_path]:stroke-secondary" />
              <span className="flex-1">{appointment.address}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-6 pt-1">
          {appointment.status === "upcoming" && onCancel && (
            <button
              onClick={() => onCancel(appointment.id)}
              className="px-5 py-2.5 rounded-full bg-primary-tint text-primary font-medium text-sm hover:bg-[#FFE5E0] transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="shrink-0"
              >
                <path
                  d="M12 4L4 12M4 4L12 12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Отменить
            </button>
          )}
          {appointment.status === "completed" && onReview && (
            <button
              onClick={() => onReview(appointment.id)}
              className="px-5 py-2.5 rounded-full bg-primary-tint text-primary font-medium text-sm hover:bg-[#FFE5E0] transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="shrink-0"
              >
                <path
                  d="M2 2h12v9H9l-3 2.5V11H2V2z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Оставить отзыв
            </button>
          )}
          <div className="text-right">
            <p className="text-foreground font-semibold text-base mb-1">
              {appointment.service}
            </p>
            <p className="text-foreground font-semibold text-2xl">
              {appointment.price} с
            </p>
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden bg-white rounded-3xl p-4 border border-border">
        <div className="flex items-start gap-3 mb-3">
          <div className="relative shrink-0">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden bg-primary-tint">
              {appointment.doctorImage ? (
                <Image
                  src={appointment.doctorImage}
                  alt={appointment.doctorName}
                  fill
                  sizes="80px"
                  className="object-cover object-top"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-dim text-2xl font-semibold">
                  {appointment.doctorName.charAt(0)}
                </div>
              )}
            </div>
            <div className="absolute top-2 left-2 flex items-center gap-0.5 bg-white rounded-md px-1.5 py-0.5 shadow-sm">
              <StarIcon className="w-3 h-3 text-primary" />
              <span className="text-primary font-semibold text-xs">
                {appointment.doctorRating}
              </span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-foreground font-semibold text-base leading-tight mb-0.5">
              {appointment.doctorName}
            </h3>
            <p className="text-muted text-sm mb-2">
              {appointment.doctorSpecialty}{" "}
              <span className="text-primary">• {appointment.doctorClinic}</span>
            </p>
            <div className="flex flex-col gap-1.5 text-sm text-secondary">
              <div className="flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4 shrink-0 [&_path]:stroke-secondary" />
                <span>
                  {appointment.date} • {appointment.time}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <MedicalServiceIcon className="w-4 h-4 shrink-0 [&_path]:stroke-secondary" />
                <span>
                  {appointment.service} • {appointment.price} с
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-sm text-secondary flex-1 min-w-0 bg-background px-3 py-2 rounded-xl">
            <GeoIcon className="w-4 h-4 shrink-0 [&_path]:stroke-secondary" />
            <span className="flex-1 truncate">{appointment.address}</span>
          </div>
          {appointment.status === "upcoming" && onCancel && (
            <button
              onClick={() => onCancel(appointment.id)}
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center shrink-0 hover:bg-primary-tint transition-colors"
              aria-label="Отменить"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M12 4L4 12M4 4L12 12"
                  stroke={colors.primary}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
          {appointment.status === "completed" && onReview && (
            <button
              onClick={() => onReview(appointment.id)}
              className="w-9 h-9 rounded-full border border-border flex items-center justify-center shrink-0 hover:bg-primary-tint transition-colors"
              aria-label="Оставить отзыв"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <path
                  d="M2 2h12v9H9l-3 2.5V11H2V2z"
                  stroke={colors.primary}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </>
  );
};
