"use client";

import { FC, useState } from "react";
import toast from "react-hot-toast";

import Image from "next/image";

import { useMutation } from "@tanstack/react-query";

import { getAppointmentById } from "@/shared/api";
import type { AppointmentStatus } from "@/shared/api";
import { Button } from "@/shared/ui";

import { formatDateLabel, formatPrice } from "../model/lib";
import type { Doctor, Service } from "../model/types";

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: "Ожидает подтверждения",
  confirmed: "Подтверждена",
  upcoming: "Предстоит",
  completed: "Завершена",
  cancelled: "Отменена",
};

export const SummaryCard: FC<{
  // Появляются после успешного оформления — включают реальную проверку статуса.
  appointmentId?: null | number;
  doctor: Doctor;
  initialStatus?: AppointmentStatus | null;
  // Формат больше не выбирается: приёмы только онлайн. Но гостю бэк
  // онлайн-запись не даёт (400), поэтому у него запись остаётся офлайновой —
  // подписываем как есть, а не как хотелось бы.
  isOnline: boolean;
  selectedDate: Date | null;
  selectedTime: null | string;
  service: Service;
}> = ({
  doctor,
  service,
  isOnline,
  selectedDate,
  selectedTime,
  appointmentId,
  initialStatus,
}) => {
  const [status, setStatus] = useState<AppointmentStatus | null>(null);

  const { mutate: checkStatus, isPending: isChecking } = useMutation({
    mutationFn: () => getAppointmentById(appointmentId as number),
    onSuccess: (appointment) => setStatus(appointment.status),
    onError: () => toast.error("Не удалось проверить статус. Попробуйте позже"),
  });

  const shownStatus = status ?? initialStatus ?? null;
  const statusLabel = shownStatus
    ? (STATUS_LABELS[shownStatus] ?? shownStatus)
    : "Не оформлена";

  return (
    <aside className="relative border border-border-soft rounded-3xl bg-white p-5 lg:sticky lg:top-6 flex flex-col gap-4 shadow-sm w-full lg:w-100">
      {isChecking && (
        <div className="absolute inset-0 z-10 bg-white/70 rounded-3xl flex items-center justify-center">
          <svg
            className="animate-spin size-10 text-primary"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        </div>
      )}

      {/* Doctor Info Row */}
      <div className="flex items-center gap-4 pb-4 border-b border-border-soft">
        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-primary-tint border border-border-soft shrink-0 flex items-center justify-center">
          {doctor.image ? (
            <Image
              src={doctor.image}
              alt={doctor.name}
              fill
              className="object-cover object-top"
              sizes="64px"
            />
          ) : (
            <span className="text-primary text-xl font-bold uppercase">
              {doctor.name.slice(0, 2)}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <h4 className="font-semibold text-foreground text-base leading-snug truncate">
            {doctor.name}
          </h4>
          <p className="text-xs text-secondary mt-0.5">{doctor.specialty}</p>
        </div>
      </div>

      {/* Appointment Details */}
      <div className="space-y-3 text-sm">
        <div className="flex flex-col gap-1">
          <span className="text-secondary text-xs">Услуга</span>
          <span className="font-semibold text-foreground leading-snug">
            {service.title}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-secondary text-xs">Формат приёма</span>
          <span className="font-medium text-foreground">
            {isOnline ? "Онлайн-консультация" : "Офлайн-консультация"}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-secondary text-xs">Дата и время</span>
          <span className="font-semibold text-primary">
            {selectedDate && selectedTime
              ? `${formatDateLabel(selectedDate)} в ${selectedTime}`
              : "Не выбраны"}
          </span>
        </div>
      </div>

      {/* Billing and Status */}
      <div className="mt-2 pt-4 border-t border-border-soft space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-secondary text-sm">К оплате</span>
          <span className="text-foreground font-bold text-[20px]">
            {formatPrice(service.price)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-secondary text-sm">Статус</span>
          <span className="px-3 py-1 rounded-full bg-[#FFF3EE] text-primary text-xs font-semibold">
            {statusLabel}
          </span>
        </div>
      </div>

      {appointmentId != null && (
        <Button
          variant="outline"
          className="w-full justify-center mt-2 text-foreground"
          disabled={isChecking}
          onClick={() => checkStatus()}
        >
          {isChecking ? "Проверяем..." : "Проверить статус"}
        </Button>
      )}
    </aside>
  );
};
