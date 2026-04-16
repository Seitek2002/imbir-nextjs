"use client";

import { FC } from "react";

import Image from "next/image";

import { GeoIcon, StarIcon } from "@/shared/assets";

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
      <div className="hidden md:flex bg-white rounded-3xl p-5 border border-[#E5E6E8] items-start gap-4">
        {/* Doctor Photo + Rating */}
        <div className="relative shrink-0">
          <div className="relative w-50 h-50 rounded-2xl overflow-hidden bg-[#FFF8F5]">
            {appointment.doctorImage ? (
              <Image
                src={appointment.doctorImage}
                alt={appointment.doctorName}
                fill
                sizes="200px"
                className="object-cover object-top scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#C4C8CA] text-4xl font-semibold">
                {appointment.doctorName.charAt(0)}
              </div>
            )}
          </div>
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-white rounded-lg px-2 py-1 shadow-sm">
            <StarIcon className="w-4 h-4 text-[#F5653E]" />
            <span className="text-[#F5653E] font-semibold text-sm">
              {appointment.doctorRating}
            </span>
          </div>
        </div>

        {/* Doctor Info */}
        <div className="flex-1 min-w-0 pt-1">
          <h3 className="text-[#191A1B] font-semibold text-xl leading-tight mb-2">
            {appointment.doctorName}
          </h3>

          <p className="text-[#838A8D] text-base mb-5">
            {appointment.doctorSpecialty}{" "}
            <span className="text-[#F5653E]">• {appointment.doctorClinic}</span>
          </p>

          <div className="flex flex-col gap-2.5 text-base text-[#686F72]">
            <div className="flex items-center gap-2">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                className="shrink-0"
              >
                <path
                  d="M6.66667 2.5V5.83333M13.3333 2.5V5.83333M3.33333 9.16667H16.6667M5 4.16667H15C15.9205 4.16667 16.6667 4.91286 16.6667 5.83333V15.8333C16.6667 16.7538 15.9205 17.5 15 17.5H5C4.07953 17.5 3.33333 16.7538 3.33333 15.8333V5.83333C3.33333 4.91286 4.07953 4.16667 5 4.16667Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>{appointment.date}</span>
            </div>

            <div className="flex items-center gap-2">
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                className="shrink-0"
              >
                <circle
                  cx="10"
                  cy="10"
                  r="7.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M10 5.83333V10L12.5 12.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span>{appointment.time}</span>
            </div>

            <div className="flex items-start gap-2">
              <GeoIcon className="w-5 h-5 mt-0.5 shrink-0 [&_path]:stroke-[#686F72]" />
              <span className="flex-1">{appointment.address}</span>
            </div>
          </div>
        </div>

        {/* Right side - Button above Service/Price */}
        <div className="flex flex-col items-end gap-6 pt-1">
          {appointment.status === "upcoming" && onCancel && (
            <button
              onClick={() => onCancel(appointment.id)}
              className="px-5 py-2.5 rounded-full bg-[#FFF8F5] text-[#F5653E] font-medium text-sm hover:bg-[#FFE5E0] transition-colors flex items-center gap-2 whitespace-nowrap"
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
              className="px-5 py-2.5 rounded-full bg-[#FFF8F5] text-[#F5653E] font-medium text-sm hover:bg-[#FFE5E0] transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="shrink-0"
              >
                <path
                  d="M13.3333 7.33333V4C13.3333 3.26362 12.7364 2.66667 12 2.66667H4C3.26362 2.66667 2.66667 3.26362 2.66667 4V12C2.66667 12.7364 3.26362 13.3333 4 13.3333H7.33333M10 10H14M12 8V12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              Оставить отзыв
            </button>
          )}

          <div className="text-right">
            <p className="text-[#191A1B] font-semibold text-base mb-1">
              {appointment.service}
            </p>
            <p className="text-[#191A1B] font-semibold text-2xl">
              {appointment.price} с
            </p>
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden bg-white rounded-3xl p-4 border border-[#E5E6E8]">
        <div className="flex items-start gap-3 mb-4">
          {/* Photo + Rating */}
          <div className="relative shrink-0">
            <div className="relative w-25 h-30 rounded-2xl overflow-hidden bg-[#FFF8F5]">
              {appointment.doctorImage ? (
                <Image
                  src={appointment.doctorImage}
                  alt={appointment.doctorName}
                  fill
                  sizes="100px"
                  className="object-cover object-top scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#C4C8CA] text-2xl font-semibold">
                  {appointment.doctorName.charAt(0)}
                </div>
              )}
            </div>
            <div className="absolute top-2 left-2 flex items-center gap-1 bg-white rounded-lg px-1.5 py-0.5 shadow-sm">
              <StarIcon className="w-3.5 h-3.5 text-[#F5653E]" />
              <span className="text-[#F5653E] font-semibold text-xs">
                {appointment.doctorRating}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="text-[#191A1B] font-semibold text-base leading-tight mb-1">
              {appointment.doctorName}
            </h3>
            <p className="text-[#838A8D] text-sm mb-3">
              {appointment.doctorSpecialty}{" "}
              <span className="text-[#F5653E]">
                • {appointment.doctorClinic}
              </span>
            </p>

            <div className="flex flex-col gap-1.5 text-sm text-[#686F72]">
              <div className="flex items-center gap-1.5">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="shrink-0"
                >
                  <path
                    d="M5.33333 2V4.66667M10.6667 2V4.66667M2.66667 7.33333H13.3333M4 3.33333H12C12.7364 3.33333 13.3333 3.93029 13.3333 4.66667V12.6667C13.3333 13.403 12.7364 14 12 14H4C3.26362 14 2.66667 13.403 2.66667 12.6667V4.66667C2.66667 3.93029 3.26362 3.33333 4 3.33333Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>{appointment.date}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="shrink-0"
                >
                  <circle
                    cx="8"
                    cy="8"
                    r="6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M8 4.66667V8L10 10"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span>
                  {appointment.service} • {appointment.price} с
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Address + Button */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-start gap-1.5 text-sm text-[#191A1B] flex-1 min-w-0 bg-[#F2F3F5] p-2 rounded-xl">
            <GeoIcon className="w-4 h-4 mt-0.5 shrink-0-0 [&_path]:stroke-[#686F72]" />
            <span className="flex-1">{appointment.address}</span>
          </div>

          {appointment.status === "upcoming" && onCancel && (
            <button
              onClick={() => onCancel(appointment.id)}
              className="w-10 h-10 rounded-full bg-[#FFF8F5] flex items-center justify-center hover:bg-[#FFE5E0] transition-colors shrink-0"
              aria-label="Отменить"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="text-[#F5653E]"
              >
                <path
                  d="M12 4L4 12M4 4L12 12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}

          {appointment.status === "completed" && onReview && (
            <button
              onClick={() => onReview(appointment.id)}
              className="w-10 h-10 rounded-full bg-[#FFF8F5] flex items-center justify-center hover:bg-[#FFE5E0] transition-colors shrink-0"
              aria-label="Оставить отзыв"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                className="text-[#F5653E]"
              >
                <path
                  d="M13.3333 7.33333V4C13.3333 3.26362 12.7364 2.66667 12 2.66667H4C3.26362 2.66667 2.66667 3.26362 2.66667 4V12C2.66667 12.7364 3.26362 13.3333 4 13.3333H7.33333M10 10H14M12 8V12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </>
  );
};
