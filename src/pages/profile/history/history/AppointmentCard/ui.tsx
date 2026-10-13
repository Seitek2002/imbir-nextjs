"use client";

import { FC } from "react";

import Link from "next/link";

import {
  CalendarIcon,
  CloseIcon,
  GeoIcon,
  MedicalServiceIcon,
  ReviewsIcon,
  StarIcon,
  VideoCallIcon,
} from "@/shared/assets/icons";
import { formatTimeRange } from "@/shared/lib/duration";
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
  onReschedule?: (id: string) => void;
  onReview?: (id: string) => void;
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

// «Записаться снова» — к тому же врачу, в ту же клинику и на ту же услугу:
// форма записи подставит их из адреса и сразу откроется на выборе времени.
const rebookHref = (appointment: Appointment) => {
  const params = new URLSearchParams();
  if (appointment.doctorId) params.set("doctor", appointment.doctorId);
  if (appointment.clinicId) params.set("clinic", appointment.clinicId);
  if (appointment.serviceId)
    params.set("service", String(appointment.serviceId));
  const query = params.toString();
  return query ? `/record?${query}` : "/record";
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

const Price: FC<{ className?: string; value?: number }> = ({
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
  const isActive =
    appointment.status === "pending" ||
    appointment.status === "confirmed" ||
    appointment.status === "scheduled" ||
    appointment.status === "upcoming";
  const isCompleted = appointment.status === "completed";
  const isCancelled = appointment.status === "cancelled";
  const showCancel = isActive && !!onCancel;
  // can_review: отзыв один на врача, поэтому после отзыва (здесь или со
  // страницы врача) кнопка пропадает у всех его приёмов.
  const showReview = isCompleted && appointment.canReview && !!onReview;
  const showReschedule = isActive && !!onReschedule && !!appointment.doctorId;
  // У прошедших и отменённых — записаться к тому же врачу ещё раз, не уходя
  // из кабинета на главную. isPast — и для записей, время которых прошло, а
  // статус так и остался «ожидает» (врач не подтвердил): без этого у них во
  // вкладке «Прошедшие» не было ни одного действия.
  const showRebook =
    (isCompleted || isCancelled || appointment.isPast === true) &&
    (!!appointment.doctorId || !!appointment.clinicId);
  // У завершённой видео-консультации «Подключиться» не показываем: бэк всё
  // равно не пустит в комнату («Консультация уже завершена»).
  const showConsultation =
    isActive && appointment.isOnline && !appointment.consultationFinished;

  const cancelledBadge = isCancelled && (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-red-50 text-red-500 text-xs font-medium">
      Отменено
    </span>
  );

  const meta = (
    <p className="text-muted">
      {appointment.doctorSpecialty}{" "}
      {appointment.doctorClinic && (
        <span className="text-primary">• {appointment.doctorClinic}</span>
      )}
    </p>
  );

  // Итоги приёма, которые врач заполнил в кабинете («Диагноз» и
  // «Рекомендации» — в отличие от заметок врача, они для пациента).
  const summary = isCompleted &&
    (appointment.diagnosis || appointment.recommendations) && (
      <div className="flex flex-col gap-2 rounded-2xl bg-background px-4 py-3 text-sm text-foreground">
        {appointment.diagnosis && (
          <div>
            <p className="text-muted mb-0.5">Диагноз</p>
            <p className="whitespace-pre-line break-words">
              {appointment.diagnosis}
            </p>
          </div>
        )}
        {appointment.recommendations && (
          <div>
            <p className="text-muted mb-0.5">Рекомендации врача</p>
            <p className="whitespace-pre-line break-words">
              {appointment.recommendations}
            </p>
          </div>
        )}
      </div>
    );

  // Рейтинга 0 у врача не бывает — это «ещё нет оценок»; «0.00» не показываем.
  const ratingBadge = (size: "lg" | "sm") =>
    appointment.doctorRating > 0 && (
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
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-foreground font-semibold text-[22px] leading-tight">
              {appointment.doctorName}
            </h3>
            {cancelledBadge}
          </div>
          <div className="text-base mb-5">{meta}</div>

          <div className="flex flex-col gap-3 text-base text-foreground">
            <div className="flex items-center gap-2.5">
              <CalendarIcon className="w-5 h-5 shrink-0 text-primary" />
              <span>{formatDateNumeric(appointment.date)}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <ClockIcon className="w-5 h-5 shrink-0 text-primary" />
              <span>
                {formatTimeRange(
                  formatTime(appointment.time),
                  appointment.serviceDuration,
                )}
              </span>
            </div>
            {appointment.address && (
              <div className="flex items-start gap-2.5">
                <GeoIcon className="w-5 h-5 mt-0.5 shrink-0 [&_path]:stroke-primary" />
                <span className="flex-1">{appointment.address}</span>
              </div>
            )}
          </div>
          {summary && <div className="mt-4">{summary}</div>}
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
            {showRebook && (
              // Ссылка, а не Button: её можно открыть в новой вкладке, и
              // Next заранее подгружает страницу записи. Вид — как у
              // соседних кнопок (Button size="sm" variant="text").
              <Link
                href={rebookHref(appointment)}
                className="font-medium flex items-center justify-center gap-2 transition-all rounded-full outline-none focus-visible:shadow-[0_0_1px_3px_rgba(245,101,62,0.45)] shrink-0 h-10 text-sm px-5 bg-[#FFF0EE] text-primary hover:bg-[#FFE4DE] active:bg-[#FFE4DE]"
              >
                <CalendarIcon className="size-5" />
                Записаться снова
              </Link>
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
            <div className="flex items-center gap-1.5 mb-0.5">
              <h3 className="text-foreground font-semibold text-base leading-tight truncate">
                {appointment.doctorName}
              </h3>
              {cancelledBadge}
            </div>
            <div className="text-sm mb-2.5">{meta}</div>

            <div className="flex flex-col gap-1.5 text-sm text-secondary">
              <div className="flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4 shrink-0 [&_path]:stroke-secondary" />
                <span>
                  {formatDateHuman(appointment.date)} •{" "}
                  {formatTimeRange(
                    formatTime(appointment.time),
                    appointment.serviceDuration,
                  )}
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

        {summary && <div className="mb-3">{summary}</div>}

        <div className="flex items-center gap-2">
          {/* Адрес клиники записи; у онлайн-консультации его нет. */}
          {appointment.address ? (
            <div className="flex items-center gap-1.5 text-sm text-secondary flex-1 min-w-0 bg-background px-3 py-2.5 rounded-2xl">
              <GeoIcon className="w-4 h-4 shrink-0 [&_path]:stroke-secondary" />
              <span className="flex-1 truncate">{appointment.address}</span>
            </div>
          ) : (
            <div className="flex-1" />
          )}

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
          {showRebook && (
            <Link
              href={rebookHref(appointment)}
              aria-label="Записаться снова"
              className="w-11 h-11 rounded-full border border-border flex items-center justify-center shrink-0 text-primary hover:bg-primary-tint transition-colors"
            >
              <CalendarIcon className="w-4.5 h-4.5" />
            </Link>
          )}
        </div>
      </div>
    </>
  );
};
